import { z } from "zod";

/** BR phone with DDD — accepts common masked formats. */
export const phoneBR = z
  .string()
  .trim()
  .min(10, "Telefone inválido")
  .max(20)
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length === 10 || v.length === 11, "Telefone inválido");

export const cpf = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length === 11, "CPF deve conter 11 dígitos");

export const email = z.string().trim().toLowerCase().email("E-mail inválido");

export const name = z
  .string()
  .trim()
  .min(2, "Nome muito curto")
  .max(120, "Nome muito longo");

/** Honeypot field — should always be empty. */
export const honeypot = z
  .string()
  .optional()
  .refine((v) => !v, "bot detected");
