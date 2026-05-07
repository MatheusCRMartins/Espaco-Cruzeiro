import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { serverEnv } from "@/lib/env";

/**
 * Create a Supabase client scoped to the current request, using the
 * user's auth cookies. Next.js 16: `cookies()` is async.
 */
export async function createSupabaseServerClient() {
  const env = serverEnv();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component that cannot set cookies.
            // The proxy (middleware) refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * Dev-only: DEV_ADMIN_BYPASS=1 injects a fake admin user so the dashboard
 * can be reviewed without a Supabase project. HARD-GUARDED against production
 * so it can never accidentally leak — double-check: `NODE_ENV !== "production"`
 * AND the flag must be literal "1".
 */
function maybeDevAdminUser() {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.DEV_ADMIN_BYPASS !== "1") return null;
  return {
    id: "00000000-0000-0000-0000-000000000000",
    email: "dev-admin@local",
    app_metadata: { role: "admin" },
    user_metadata: { role: "admin" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as unknown as import("@supabase/supabase-js").User;
}

export async function getCurrentUser() {
  const bypass = maybeDevAdminUser();
  if (bypass) return bypass;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch {
    // Env not configured yet (e.g. fresh clone before .env.local exists).
    return null;
  }
}

export async function isAdmin() {
  if (maybeDevAdminUser()) return true;
  const user = await getCurrentUser();
  if (!user) return false;
  const role =
    (user.app_metadata?.role as string | undefined) ??
    (user.user_metadata?.role as string | undefined);
  return role === "admin";
}
