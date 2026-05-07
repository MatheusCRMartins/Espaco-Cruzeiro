import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Container, Eyebrow, Section } from "@/components/ui/container";
import { BUSINESS } from "@/lib/constants";
import { waLink } from "@/lib/utils";

import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Fale com o Espaço Cruzeiro",
  description:
    "Tire suas dúvidas, peça um orçamento ou agende uma visita ao Espaço Cruzeiro — buffet em Osasco para casamentos, aniversários, chás e eventos corporativos.",
};

const CONTACT_MESSAGE =
  "Olá! Cheguei pela página de contato do Espaço Cruzeiro.";

export default function ContatoPage() {
  const waNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? BUSINESS.contact.whatsappNumber;

  return (
    <>
      <Section className="border-b border-border">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Contato</Eyebrow>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              Bora conversar sobre o seu evento?
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Respondemos em até 24h por e-mail — ou em minutos no WhatsApp.
              Conta pra gente como você imagina o dia e voltamos com uma
              proposta clara.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <ContactForm />

            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold">
                  Jeito rápido
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  O WhatsApp é o canal mais ágil. Mande oi que a gente te
                  responde em minutos no horário comercial.
                </p>
                <a
                  href={waLink(waNumber, CONTACT_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#22c35e]"
                >
                  <MessageCircle className="size-4" />
                  Abrir WhatsApp
                </a>
              </div>

              <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold">
                  Onde estamos
                </h2>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-foreground">
                      {BUSINESS.address.street}
                    </p>
                    <p>
                      {BUSINESS.address.neighborhood} ·{" "}
                      {BUSINESS.address.city}/{BUSINESS.address.state}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                  <p>{BUSINESS.contact.phone}</p>
                </div>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                  <a
                    href={`mailto:${BUSINESS.contact.email}`}
                    className="hover:text-foreground"
                  >
                    {BUSINESS.contact.email}
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold">
                  Horário de atendimento
                </h2>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {BUSINESS.hours.map((h) => (
                    <li
                      key={h.label}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="text-muted-foreground">{h.label}</span>
                      <span className="text-foreground">{h.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
