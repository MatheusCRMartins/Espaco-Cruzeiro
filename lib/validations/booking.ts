import { z } from "zod";

import { cpf, email, honeypot, name, phoneBR } from "./common";

export const bookingInputSchema = z.object({
  eventTypeId: z.string().uuid(),
  eventDate: z.string().date(), // ISO YYYY-MM-DD
  eventStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Horário inválido"),
  guestsCount: z.coerce.number().int().min(1).max(2000),
  paymentType: z.enum(["deposit", "full"]),
  customerName: name,
  customerEmail: email,
  customerPhone: phoneBR,
  customerCpf: cpf,
  notes: z.string().trim().max(2000).optional().nullable(),
  consent: z.literal(true, { message: "É necessário aceitar os termos" }),
  website: honeypot, // honeypot
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export const availabilityQuerySchema = z.object({
  eventTypeId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Formato esperado: YYYY-MM"),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
