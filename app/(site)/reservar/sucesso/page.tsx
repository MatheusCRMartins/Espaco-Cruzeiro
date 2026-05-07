import type { Metadata } from "next";

import { Container, Section } from "@/components/ui/container";

import { SucessoClient } from "./sucesso-client";

export const metadata: Metadata = {
  title: "Pagamento recebido",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ booking?: string; mock?: string }>;

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const bookingId = sp.booking ?? null;
  const mock = sp.mock === "1";

  return (
    <Section>
      <Container>
        <SucessoClient bookingId={bookingId} mock={mock} />
      </Container>
    </Section>
  );
}
