"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { waLink } from "@/lib/utils";

/**
 * Floating WhatsApp button, visible on every public page except the
 * reservation checkout flow (to avoid distracting users mid-payment).
 * Message pre-fill is contextual per page.
 *
 * Recebe whatsappNumber via prop pra ficar no servidor a fonte de verdade
 * (business_settings) e nunca depender de hardcode no client.
 */
const CONTEXTUAL_MESSAGES: Record<string, string> = {
  "/": "Olá! Vi o site do Espaço Cruzeiro e gostaria de tirar uma dúvida.",
  "/sobre": "Olá! Tenho interesse em conhecer melhor o Espaço Cruzeiro.",
  "/contato": "Olá! Gostaria de falar com a equipe do Espaço Cruzeiro.",
  "/eventos/casamentos":
    "Olá! Tenho interesse em reservar o Espaço Cruzeiro para um casamento.",
  "/eventos/aniversarios":
    "Olá! Tenho interesse em reservar o Espaço Cruzeiro para um aniversário.",
  "/eventos/cha-de-bebe":
    "Olá! Tenho interesse em reservar o Espaço Cruzeiro para um chá de bebê.",
  "/eventos/revelacao":
    "Olá! Tenho interesse em reservar o Espaço Cruzeiro para um chá revelação.",
  "/eventos/corporativos":
    "Olá! Tenho interesse em reservar o Espaço Cruzeiro para um evento corporativo.",
  "/eventos/confraternizacoes":
    "Olá! Tenho interesse em reservar o Espaço Cruzeiro para uma confraternização.",
};

export function WhatsAppFloat({ whatsappNumber }: { whatsappNumber: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/reservar")) return null;

  const message =
    CONTEXTUAL_MESSAGES[pathname] ??
    "Olá! Tenho uma dúvida sobre o Espaço Cruzeiro.";

  return (
    <a
      href={waLink(whatsappNumber, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-black/10 transition hover:scale-[1.02] hover:bg-[#22bf5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <MessageCircle className="size-5" aria-hidden />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
