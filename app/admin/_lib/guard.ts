import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser, isAdmin } from "@/lib/supabase/server";

/**
 * Server action / server component guard — chame antes de qualquer mutação
 * administrativa. Em caso de falha, redireciona para /login.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!(await isAdmin())) redirect("/?error=forbidden");
  return user;
}
