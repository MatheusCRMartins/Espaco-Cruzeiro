"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/eventos/casamentos", label: "Casamentos" },
  { href: "/eventos/aniversarios", label: "Aniversários" },
  { href: "/eventos/corporativos", label: "Corporativos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader({
  businessName,
}: {
  businessName: string;
  /** Mantido por compat com o layout — não usado no header pós Onda 4.1. */
  whatsappNumber?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Espaço Cruzeiro — Home">
          <LogoMark />
          <span className="font-display text-lg font-semibold tracking-tight">
            {businessName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/visita"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Agendar visita
          </Link>
          <Link href="/reservar" className={buttonVariants({ size: "sm" })}>
            Reservar
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
          aria-expanded={open}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden border-t border-border bg-background transition-[max-height,opacity] duration-200 overflow-hidden",
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col px-6 py-4 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-2 text-foreground/80 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-4 flex gap-3 pb-2">
            <Link
              href="/visita"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
            >
              Visitar
            </Link>
            <Link
              href="/reservar"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ size: "sm" }), "flex-1")}
            >
              Reservar
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <span
      aria-hidden
      className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-display text-[13px] font-semibold"
    >
      EC
    </span>
  );
}
