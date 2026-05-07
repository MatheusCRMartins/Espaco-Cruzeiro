"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Toaster } from "sonner";

import { cn } from "@/lib/utils";

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
  { href: "/admin/comunicacoes", label: "Comunicações" },
  { href: "/admin/auditoria", label: "Auditoria" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function NavItems({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 bg-sidebar text-sidebar-foreground">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border px-6 py-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Espaço Cruzeiro
          </p>
          <p className="mt-1 text-sm text-sidebar-foreground/80">Painel admin</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <NavItems />
        </nav>
        <div className="border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-foreground/60">
          {email}
        </div>
      </aside>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Fechar menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-sidebar-border bg-sidebar shadow-xl">
            <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                  Espaço Cruzeiro
                </p>
                <p className="mt-1 text-sm text-sidebar-foreground/80">Painel admin</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="rounded p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              <NavItems onNavigate={() => setOpen(false)} />
            </nav>
            <div className="border-t border-sidebar-border px-5 py-3 text-xs text-sidebar-foreground/60">
              {email}
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted md:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="text-sm font-medium">Gestão</div>
          </div>
          <SignOutButton />
        </header>
        <main className="flex-1 bg-background p-4 sm:p-6">{children}</main>
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "border border-border",
          },
        }}
      />
    </div>
  );
}
