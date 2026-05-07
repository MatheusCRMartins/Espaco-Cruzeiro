import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16: middleware was renamed to `proxy`.
 * Runtime is `nodejs` (edge is not supported in proxy).
 *
 * Responsibilities:
 *  1. Refresh the Supabase auth session cookie on every request.
 *  2. Protect `/admin/*` — unauthenticated users are redirected to `/login`.
 *     Non-admin users are redirected to home with `?error=forbidden`.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Dev-only bypass: lets developers review /admin UI without a Supabase
  // project. Hard-guarded against production.
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_ADMIN_BYPASS === "1"
  ) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env is not configured yet, fall through — this avoids crashing local dev
  // before the developer sets up Supabase credentials.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const pathname = request.nextUrl.pathname;

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    const role =
      (user.app_metadata?.role as string | undefined) ??
      (user.user_metadata?.role as string | undefined);
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  /**
   * Antes: matcher rodava em quase todo path, fazendo Supabase auth refresh
   * em qualquer request pública (incluindo /api/webhooks/mercadopago e
   * /api/bookings). Custo: latência + DoS amplificado, e o webhook MP quebra
   * se o Supabase ficar indisponível.
   *
   * Agora: roda só em /admin/* e /api/admin/* (que é onde realmente precisa
   * do refresh de cookie + role check). Login do admin é feito via Server
   * Action (ver app/login/actions.ts) que cria o cookie diretamente; aqui
   * só validamos sessão pra páginas e endpoints administrativos.
   */
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
