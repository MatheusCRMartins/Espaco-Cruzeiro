import type { Metadata } from "next";

import { LegalPage } from "@/components/site/legal-page";
import { getBusinessSettings } from "@/lib/business-settings";

export const metadata: Metadata = {
  title: "Política de Cancelamento",
  description:
    "Regras de cancelamento, reembolso e remarcação de eventos contratados no Espaço Cruzeiro.",
};

export default async function CancelationPage() {
  const settings = await getBusinessSettings();
  return (
    <LegalPage
      eyebrow="Política"
      title="Política de Cancelamento"
      lastUpdated="1 de outubro de 2025"
    >
      <section className="space-y-3">
        <p>
          Nosso objetivo é que seu evento aconteça como planejado — mas
          imprevistos acontecem. Esta política explica como funcionam
          cancelamentos, reembolsos e remarcações.
        </p>
      </section>

      <section className="space-y-3">
        <h2>1. Direito de arrependimento</h2>
        <p>
          Se você contratou pela internet, tem até{" "}
          <strong>7 (sete) dias corridos</strong> a partir do pagamento do
          sinal para desistir sem custo (art. 49 do Código de Defesa do
          Consumidor), desde que o evento ainda esteja a mais de 30 dias de
          distância. Nesse caso, o sinal é reembolsado integralmente.
        </p>
      </section>

      <section className="space-y-3">
        <h2>2. Cancelamento pelo contratante</h2>
        <p>
          Fora do prazo de arrependimento, o reembolso do sinal segue a tabela
          abaixo (considerando a antecedência em relação à data do evento):
        </p>
        <ul>
          <li>
            <strong>Mais de 90 dias:</strong> reembolso de 70% do sinal.
          </li>
          <li>
            <strong>Entre 60 e 90 dias:</strong> reembolso de 50% do sinal.
          </li>
          <li>
            <strong>Entre 30 e 59 dias:</strong> reembolso de 25% do sinal.
          </li>
          <li>
            <strong>Menos de 30 dias:</strong> sem reembolso do sinal, pois já
            mobilizamos equipe e fornecedores.
          </li>
        </ul>
        <p>
          O reembolso é feito pelo mesmo meio de pagamento em até{" "}
          <strong>10 dias úteis</strong> após a confirmação.
        </p>
      </section>

      <section className="space-y-3">
        <h2>3. Remarcação</h2>
        <p>
          Em vez de cancelar, você pode remarcar uma única vez sem custo
          adicional, desde que:
        </p>
        <ul>
          <li>O pedido seja feito com pelo menos 30 dias de antecedência.</li>
          <li>A nova data esteja disponível na agenda.</li>
          <li>Seja dentro de 12 meses contados da data original.</li>
        </ul>
        <p>
          Uma segunda remarcação é avaliada caso a caso e pode incluir taxa
          administrativa.
        </p>
      </section>

      <section className="space-y-3">
        <h2>4. Cancelamento por força maior</h2>
        <p>
          Em casos comprovados de força maior (falecimento em família,
          hospitalização, determinação de autoridade pública), priorizamos a{" "}
          <strong>remarcação sem custos</strong>, independentemente da
          antecedência.
        </p>
      </section>

      <section className="space-y-3">
        <h2>5. Cancelamento pelo Espaço Cruzeiro</h2>
        <p>
          Em situações excepcionais em que não consigamos realizar o evento
          (ex.: sinistro no espaço), oferecemos:
        </p>
        <ul>
          <li>
            Reembolso integral de tudo que foi pago, corrigido pelo IPCA, ou
          </li>
          <li>
            Remarcação sem custos para a data mais próxima que funcione para
            você.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>6. Como solicitar</h2>
        <p>
          Envie um e-mail para{" "}
          <a href={`mailto:${settings.contact.email}`}>
            {settings.contact.email}
          </a>{" "}
          com o código da sua reserva e o motivo. Retornamos em até 3 dias
          úteis com o cálculo do reembolso ou a proposta de nova data.
        </p>
      </section>
    </LegalPage>
  );
}
