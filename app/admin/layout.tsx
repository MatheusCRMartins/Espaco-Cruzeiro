import { redirect } from "next/navigation";

import { getCurrentUser, isAdmin } from "@/lib/supabase/server";

import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt-and-suspenders: proxy already guards, but the server-side check
  // prevents any access if proxy is misconfigured.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!(await isAdmin())) redirect("/?error=forbidden");

  return <AdminShell email={user.email ?? "(sem email)"}>{children}</AdminShell>;
}
