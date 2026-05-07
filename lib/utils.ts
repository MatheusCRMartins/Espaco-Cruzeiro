import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return BRL.format(Number.isFinite(n) ? n : 0);
}

export function waLink(
  phone: string,
  message?: string,
  baseUrl = "https://wa.me",
) {
  const cleaned = phone.replace(/\D/g, "");
  const qs = message ? `?text=${encodeURIComponent(message)}` : "";
  return `${baseUrl}/${cleaned}${qs}`;
}
