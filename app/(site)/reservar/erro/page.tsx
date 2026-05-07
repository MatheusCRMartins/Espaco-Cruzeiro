import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getBusinessSettings } from "@/lib/business-settings";
import { waLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pagamento não concluído",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ booking?: string }>;

export default async function PaymentErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const booking = sp.booking;
  const settings = await getBusinessSettings();
  const waNumber = settings.contact.whatsappNumber;

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
          <XCircle className="mx-auto size-12 text-destructive" />
          <h1 className="mt-4 font-display text-3xl font-semibold">
            Pagamento não concluído
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            O processador de pagamento não conseguiu concluir a transação. Nenhum valor
            foi cobrado.
          </p>
          {booking && (
            <p className="mt-2 text-xs text-muted-foreground">
              Referência: <strong>{booking}</strong>
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/reservar" className={buttonVariants({ size: "md" })}>
              Tentar novamente
            </Link>
            <a
              href={waLink(
                waNumber,
                `Olá! Tive um problema ao pagar a reserva${
                  booking ? ` (${booking})` : ""
                }.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "md" })}
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
