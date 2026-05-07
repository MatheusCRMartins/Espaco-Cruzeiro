"use server";

import "server-only";

import { getDb, schema } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { BUSINESS } from "@/lib/constants";
import { leadInputSchema } from "@/lib/validations/lead";

export type ContactActionState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const INITIAL: ContactActionState = { status: "idle" };

/**
 * Server Action — /contato form.
 *
 * - Validates with Zod (leadInputSchema, honeypot + LGPD consent obrigatório)
 * - Grava em `leads` com source = "contact_page"
 * - Dispara `notify("email", "admin_new_lead", ...)` best-effort
 */
export async function submitContact(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    estimatedDate: formData.get("estimatedDate") || undefined,
    estimatedGuests: formData.get("estimatedGuests") || undefined,
    message: formData.get("message"),
    source: "contact_page" as const,
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
    website: formData.get("website") ?? "", // honeypot
  };

  const parsed = leadInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const db = getDb();
    const [inserted] = await db
      .insert(schema.leads)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        estimatedDate: data.estimatedDate ?? null,
        estimatedGuests: data.estimatedGuests ?? null,
        message: data.message ?? null,
        source: data.source,
      })
      .returning({ id: schema.leads.id });

    // best-effort notification — não derruba o fluxo se falhar
    void notify("email", {
      recipient: BUSINESS.contact.email,
      template: "admin_new_lead",
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message ?? "",
        estimatedDate: data.estimatedDate ?? "",
        estimatedGuests: data.estimatedGuests ?? "",
      },
      relatedLeadId: inserted?.id,
    });

    return {
      status: "ok",
      message:
        "Recebemos sua mensagem! Respondemos em até 24h — ou fale no WhatsApp para resposta em minutos.",
    };
  } catch (err) {
    console.error("[contato] submit failed:", err);
    return {
      status: "error",
      message:
        "Não conseguimos enviar agora. Tente novamente em instantes ou fale pelo WhatsApp.",
    };
  }
}

export { INITIAL as CONTACT_INITIAL_STATE };
