import { z } from "zod";

import { cpf, email, honeypot, name, phoneBR } from "./common";

export const leadSourceValues = [
  "home_form",
  "contact_page",
  "calculator",
  "event_page",
  "exit_intent",
] as const;

export const leadInputSchema = z.object({
  name,
  email,
  phone: phoneBR,
  eventTypeId: z.string().uuid().optional().nullable(),
  estimatedDate: z.string().date().optional().nullable(),
  estimatedGuests: z.coerce.number().int().min(1).max(2000).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  source: z.enum(leadSourceValues).default("home_form"),
  consent: z.literal(true, { message: "É necessário aceitar os termos" }),
  website: honeypot, // honeypot
});

export type LeadInput = z.infer<typeof leadInputSchema>;

// Optional CPF version for reservation flow where lead may already have CPF
export const qualifiedLeadSchema = leadInputSchema.extend({
  cpf: cpf.optional(),
});
