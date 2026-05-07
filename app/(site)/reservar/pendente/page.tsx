import type { Metadata } from "next";
import { Clock } from "lucide-react";

import { Container, Section } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Pagamento em análise",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ booking?: string }>;

export default async function PendingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const booking = sp.booking;

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
          <Clock className="mx-auto size-10 text-accent" />
          <h1 className="mt-4 font-display text-3xl font-semibold">
            Pagamento em análise
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            O Mercado Pago está analisando seu pagamento. Assim que for aprovado, você
            recebe a confirmação por e-mail — pode levar de alguns minutos a algumas
            horas, dependendo do método.
          </p>
          {booking && (
            <p className="mt-2 text-xs text-muted-foreground">
              Referência: <strong>{booking}</strong>
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
