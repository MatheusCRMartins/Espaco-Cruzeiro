import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser, isAdmin } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/calendario", label: "Calendário" },
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/disponibilidade", label: "Disponibilidade" },
  { href: "/admin/tipos-evento", label: "Tipos de evento" },
  { href: "/admin/galeria", label: "Galeria" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/conteudo", label: "Conteúdo" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

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

  return (
    <div className="flex min-h-screen flex-1 bg-sidebar text-sidebar-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border px-6 py-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Espaço Cruzeiro
          </p>
          <p className="mt-1 text-sm text-sidebar-foreground/80">Painel admin</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-foreground/60">
          {user.email}
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
          <div className="text-sm font-medium">Gestão</div>
          <SignOutButton />
        </header>
        <main className="flex-1 bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
