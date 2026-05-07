import type { Metadata } from "next";

import { LegalPage } from "@/components/site/legal-page";
import { getBusinessSettings } from "@/lib/business-settings";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Espaço Cruzeiro coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.",
};

export default async function PrivacyPage() {
  const settings = await getBusinessSettings();
  return (
    <LegalPage
      eyebrow="Política"
      title="Política de Privacidade"
      lastUpdated="1 de outubro de 2025"
    >
      <section className="space-y-3">
        <p>
          Esta política descreve como o <strong>{settings.legalName}</strong>{" "}
          (&ldquo;nós&rdquo;) coleta, utiliza, armazena e compartilha os dados
          pessoais de quem usa este site e contrata nossos serviços, em
          conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018 —
          LGPD).
        </p>
      </section>

      <section className="space-y-3">
        <h2>1. Dados que coletamos</h2>
        <ul>
          <li>
            <strong>Cadastro/contato:</strong> nome, e-mail, telefone, CPF (quando
            aplicável para emissão de contrato/nota fiscal).
          </li>
          <li>
            <strong>Evento:</strong> data, número estimado de convidados, tipo
            de evento, preferências e mensagens enviadas pelos formulários.
          </li>
          <li>
            <strong>Pagamento:</strong> processado por provedor terceiro
            (Mercado Pago). Não armazenamos dados do cartão.
          </li>
          <li>
            <strong>Uso do site:</strong> dados agregados de navegação (páginas
            visitadas, IP, device) via cookies estritamente necessários.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>2. Finalidades</h2>
        <ul>
          <li>Responder solicitações de orçamento e dúvidas.</li>
          <li>Processar reservas, pagamentos e emitir contratos.</li>
          <li>Enviar comunicações sobre o evento (lembretes, alterações).</li>
          <li>Cumprir obrigações legais e fiscais.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>3. Base legal</h2>
        <p>
          Tratamos seus dados com base em <strong>execução de contrato</strong>,{" "}
          <strong>consentimento</strong> (para comunicações opcionais),{" "}
          <strong>cumprimento de obrigação legal</strong> e{" "}
          <strong>legítimo interesse</strong> (segurança e prevenção a fraudes).
        </p>
      </section>

      <section className="space-y-3">
        <h2>4. Compartilhamento</h2>
        <p>
          Compartilhamos seus dados apenas com fornecedores estritamente
          necessários à operação — como provedor de pagamento (Mercado Pago),
          serviço de envio de e-mails (Resend), hospedagem e banco de dados
          (Supabase/Vercel). Não vendemos dados.
        </p>
      </section>

      <section className="space-y-3">
        <h2>5. Seus direitos</h2>
        <p>
          Você pode, a qualquer momento, solicitar: acesso, correção, exclusão,
          portabilidade, anonimização, informação sobre compartilhamento e
          revogação do consentimento. Basta escrever para{" "}
          <a href={`mailto:${settings.contact.email}`}>
            {settings.contact.email}
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. Retenção</h2>
        <p>
          Mantemos os dados pelo tempo necessário ao cumprimento das
          finalidades acima e das obrigações legais (ex.: 5 anos para dados
          fiscais). Após esse prazo, os dados são anonimizados ou excluídos.
        </p>
      </section>

      <section className="space-y-3">
        <h2>7. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizacionais compatíveis para
          proteger seus dados — criptografia em trânsito, controle de acesso
          por perfil e registro de auditoria.
        </p>
      </section>

      <section className="space-y-3">
        <h2>8. Contato do encarregado</h2>
        <p>
          Dúvidas sobre esta política?{" "}
          <a href={`mailto:${settings.contact.email}`}>
            {settings.contact.email}
          </a>{" "}
          — respondemos em até 15 dias úteis.
        </p>
      </section>
    </LegalPage>
  );
}
