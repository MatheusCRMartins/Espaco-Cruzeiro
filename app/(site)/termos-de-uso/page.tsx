import type { Metadata } from "next";

import { LegalPage } from "@/components/site/legal-page";
import { getBusinessSettings } from "@/lib/business-settings";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos e condições de uso do site do Espaço Cruzeiro e da contratação dos serviços de eventos.",
};

export default async function TermsPage() {
  const settings = await getBusinessSettings();
  return (
    <LegalPage
      eyebrow="Termos"
      title="Termos de Uso"
      lastUpdated="1 de outubro de 2025"
    >
      <section className="space-y-3">
        <p>
          Ao utilizar este site e contratar os serviços do{" "}
          <strong>{settings.legalName}</strong>, você concorda com os termos
          descritos a seguir. Leia com atenção antes de concluir uma reserva.
        </p>
      </section>

      <section className="space-y-3">
        <h2>1. Objeto</h2>
        <p>
          Este site disponibiliza informações sobre o espaço, tipos de evento e
          um sistema de reservas online. A reserva é confirmada mediante
          pagamento de sinal e aceitação do contrato específico do evento.
        </p>
      </section>

      <section className="space-y-3">
        <h2>2. Cadastro</h2>
        <ul>
          <li>
            As informações fornecidas devem ser verdadeiras e atualizadas.
          </li>
          <li>
            Você é responsável pelas ações realizadas na sua conta.
          </li>
          <li>
            Menores de 18 anos devem estar representados por responsáveis
            legais.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>3. Reserva e pagamento</h2>
        <ul>
          <li>
            A disponibilidade exibida no site é provisória até a confirmação
            do pagamento do sinal.
          </li>
          <li>
            O pagamento é processado por provedor terceiro (Mercado Pago). Os
            dados do cartão não trafegam pelos nossos servidores.
          </li>
          <li>
            Após a confirmação do pagamento, a data fica bloqueada para você.
          </li>
          <li>
            O saldo remanescente deve ser quitado até a data combinada em
            contrato (em regra, 15 dias antes do evento).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>4. Uso do espaço</h2>
        <ul>
          <li>
            O contratante se responsabiliza pela conduta dos convidados e por
            eventuais danos ao patrimônio do espaço.
          </li>
          <li>
            Fornecedores externos (DJ, decoração, etc.) são permitidos mediante
            aviso prévio — a equipe orienta sobre horários de carga/descarga.
          </li>
          <li>
            É proibido o uso de fogos de artifício sem autorização prévia por
            escrito.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>5. Cancelamento</h2>
        <p>
          O cancelamento por parte do contratante é regido pela{" "}
          <a href="/politica-de-cancelamento">Política de Cancelamento</a>. Em
          caso de força maior comprovada, avaliamos a remarcação sem custos
          adicionais.
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. Limitação de responsabilidade</h2>
        <p>
          Não nos responsabilizamos por prejuízos decorrentes de força maior
          (ex.: apagões prolongados por causa externa, catástrofes naturais)
          ou por itens deixados no espaço após o evento.
        </p>
      </section>

      <section className="space-y-3">
        <h2>7. Propriedade intelectual</h2>
        <p>
          Todo o conteúdo deste site (textos, imagens, logotipos) pertence ao{" "}
          {settings.legalName} ou é utilizado mediante licença. Proibida a
          reprodução sem autorização.
        </p>
      </section>

      <section className="space-y-3">
        <h2>8. Foro</h2>
        <p>
          Fica eleito o foro da Comarca de Osasco/SP para dirimir quaisquer
          controvérsias decorrentes destes termos.
        </p>
      </section>

      <section className="space-y-3">
        <h2>9. Atualizações</h2>
        <p>
          Podemos atualizar estes termos a qualquer momento. A data da última
          atualização está indicada no topo da página.
        </p>
      </section>
    </LegalPage>
  );
}
