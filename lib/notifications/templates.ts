import type { BusinessSettingsData } from "@/lib/business-settings";

import type { NotificationPayload, NotificationTemplate } from "./types";

type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacocruzeiro.com.br";

function layout(title: string, bodyHtml: string, business: BusinessSettingsData) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escape(title)}</title>
</head>
<body style="margin:0;background:#f4efe5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1b1b1b;">
  <center>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border:1px solid #e6e1d4;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#1d3a2c;padding:24px 28px;color:#f6f1e5;">
              <div style="letter-spacing:4px;text-transform:uppercase;font-size:11px;color:#d6b067;">${escape(business.name)}</div>
              <div style="margin-top:6px;font-size:22px;font-weight:600;">${escape(title)}</div>
            </td>
          </tr>
          <tr><td style="padding:28px;font-size:15px;line-height:1.6;color:#333;">
            ${bodyHtml}
          </td></tr>
          <tr><td style="padding:20px 28px;border-top:1px solid #efe9dc;font-size:12px;color:#777;">
            ${escape(business.legalName)}<br/>
            ${escape(business.address.street)} — ${escape(business.address.city)}/${escape(business.address.state)}<br/>
            <a href="${SITE}" style="color:#1d3a2c;">${escape(SITE.replace(/^https?:\/\//, ""))}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </center>
</body></html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:#1d3a2c;color:#f6f1e5;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:500;">${escape(label)}</a></p>`;
}

function escape(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function renderEmail(
  payload: NotificationPayload,
  business: BusinessSettingsData,
): RenderedEmail {
  const d = payload.data as Record<string, string | number | undefined>;
  const t: NotificationTemplate = payload.template;

  switch (t) {
    case "admin_new_lead": {
      const title = "Novo lead recebido";
      const body = `
        <p>Chegou um novo contato pelo site:</p>
        <p><strong>${escape(String(d.name ?? ""))}</strong><br/>
        ${escape(String(d.email ?? ""))} · ${escape(String(d.phone ?? ""))}</p>
        ${d.estimatedDate ? `<p>Data estimada: <strong>${escape(String(d.estimatedDate))}</strong></p>` : ""}
        ${d.estimatedGuests ? `<p>Convidados: <strong>${escape(String(d.estimatedGuests))}</strong></p>` : ""}
        ${d.message ? `<blockquote style="border-left:3px solid #d6b067;padding:4px 12px;margin:12px 0;color:#444;">${escape(String(d.message))}</blockquote>` : ""}
        ${button(`${SITE}/admin/leads`, "Abrir no painel")}
      `;
      return {
        subject: `[Lead] ${d.name ?? "novo contato"}`,
        html: layout(title, body, business),
        text: `Novo lead: ${d.name} — ${d.email} / ${d.phone}. Painel: ${SITE}/admin/leads`,
      };
    }

    case "admin_new_booking_pending": {
      const title = "Reserva aguardando pagamento";
      const body = `
        <p>Uma nova reserva foi criada e está aguardando confirmação do pagamento.</p>
        <p><strong>${escape(String(d.bookingCode ?? ""))}</strong> · ${escape(String(d.customerName ?? ""))}<br/>
        Evento: ${escape(String(d.eventDate ?? ""))} às ${escape(String(d.eventStartTime ?? ""))}</p>
        ${button(`${SITE}/admin/reservas`, "Ver no painel")}
      `;
      return {
        subject: `[Reserva pendente] ${d.bookingCode}`,
        html: layout(title, body, business),
        text: `Reserva pendente ${d.bookingCode} — ${d.customerName}`,
      };
    }

    case "admin_booking_confirmed": {
      const title = "Reserva confirmada";
      const body = `
        <p>O pagamento foi aprovado.</p>
        <p><strong>${escape(String(d.bookingCode ?? ""))}</strong> · ${escape(String(d.customerName ?? ""))}<br/>
        Evento: ${escape(fmtDate(String(d.eventDate ?? "")))}<br/>
        Valor: R$ ${escape(String(d.totalAmount ?? ""))}</p>
        ${button(`${SITE}/admin/reservas`, "Ver no painel")}
      `;
      return {
        subject: `[Confirmada] ${d.bookingCode} — ${d.customerName}`,
        html: layout(title, body, business),
        text: `Reserva ${d.bookingCode} confirmada.`,
      };
    }

    case "customer_booking_pending": {
      const title = "Finalize sua reserva";
      const body = `
        <p>Olá, ${escape(String(d.customerName ?? ""))}!</p>
        <p>Sua reserva <strong>${escape(String(d.bookingCode ?? ""))}</strong> está quase pronta. Basta concluir o pagamento para garantir a data.</p>
        ${d.checkoutUrl ? button(String(d.checkoutUrl), "Concluir pagamento") : ""}
        <p style="color:#666;font-size:13px;">Ficou com alguma dúvida? Responda este e-mail ou fale pelo WhatsApp.</p>
      `;
      return {
        subject: "Finalize sua reserva — Espaço Cruzeiro",
        html: layout(title, body, business),
        text: `Finalize sua reserva ${d.bookingCode}: ${d.checkoutUrl ?? ""}`,
      };
    }

    case "customer_booking_confirmed": {
      const title = "Reserva confirmada! 🎉";
      const body = `
        <p>Olá, ${escape(String(d.customerName ?? ""))}!</p>
        <p>Recebemos seu pagamento e sua data está garantida.</p>
        <p><strong>${escape(String(d.bookingCode ?? ""))}</strong><br/>
        Evento: ${escape(fmtDate(String(d.eventDate ?? "")))} às ${escape(String(d.eventStartTime ?? ""))}</p>
        <p>Em breve entramos em contato para alinhar os detalhes — cardápio, decoração, cerimonial, tudo no tempo certo.</p>
        <p style="color:#666;font-size:13px;">Qualquer alteração precisa ser solicitada com antecedência. Veja a <a href="${SITE}/politica-de-cancelamento">política de cancelamento</a>.</p>
      `;
      return {
        subject: `Sua reserva ${d.bookingCode} está confirmada`,
        html: layout(title, body, business),
        text: `Sua reserva ${d.bookingCode} está confirmada para ${d.eventDate}.`,
      };
    }

    case "customer_booking_cancelled": {
      const title = "Reserva cancelada";
      const body = `
        <p>Olá, ${escape(String(d.customerName ?? ""))}.</p>
        <p>Sua reserva <strong>${escape(String(d.bookingCode ?? ""))}</strong> foi cancelada.</p>
        ${d.paymentStatus ? `<p>Status do pagamento: ${escape(String(d.paymentStatus))}</p>` : ""}
        <p>Se foi engano ou se quiser remarcar, responda este e-mail ou fale no WhatsApp — a gente resolve.</p>
      `;
      return {
        subject: `Reserva ${d.bookingCode} cancelada`,
        html: layout(title, body, business),
        text: `Reserva ${d.bookingCode} cancelada.`,
      };
    }

    case "customer_reminder_d7": {
      const title = "Seu evento é daqui a 7 dias";
      const body = `
        <p>Olá, ${escape(String(d.customerName ?? ""))}!</p>
        <p>Faltam <strong>7 dias</strong> para o seu evento <strong>${escape(String(d.bookingCode ?? ""))}</strong>.</p>
        <p>Se ainda existe algum detalhe para fechar (cardápio, número final de convidados, observações especiais), este é o momento — depois deste prazo, alterações ficam limitadas.</p>
        <p>Nos responda aqui ou chame no WhatsApp se precisar de qualquer coisa.</p>
      `;
      return {
        subject: "Faltam 7 dias para seu evento",
        html: layout(title, body, business),
        text: `Faltam 7 dias para seu evento ${d.bookingCode}.`,
      };
    }

    case "customer_cart_recovery": {
      const title = "Sua reserva está te esperando";
      const body = `
        <p>Olá, ${escape(String(d.customerName ?? ""))}!</p>
        <p>Você começou uma reserva (<strong>${escape(String(d.bookingCode ?? ""))}</strong>) no ${escape(business.name)} mas ainda não finalizou o pagamento. Sua data fica trancada por mais um tempinho — depois disso ela volta pro calendário público.</p>
        ${d.checkoutUrl ? button(String(d.checkoutUrl), "Concluir pagamento") : ""}
        <p style="color:#666;font-size:13px;">Se desistiu, sem problema — só ignore esse e-mail. Mas se ficou alguma dúvida, responda aqui ou chame no WhatsApp.</p>
      `;
      return {
        subject: "Sua reserva está te esperando",
        html: layout(title, body, business),
        text: `Sua reserva ${d.bookingCode} ainda está aberta. Finalize: ${d.checkoutUrl ?? ""}`,
      };
    }

    case "customer_reminder_d1": {
      const title = "Seu evento é amanhã!";
      const body = `
        <p>Olá, ${escape(String(d.customerName ?? ""))}!</p>
        <p>Seu evento <strong>${escape(String(d.bookingCode ?? ""))}</strong> é <strong>amanhã</strong> às ${escape(String(d.eventStartTime ?? ""))}.</p>
        <p>Endereço: ${escape(business.address.street)} — ${escape(business.address.neighborhood)}, ${escape(business.address.city)}/${escape(business.address.state)}.</p>
        <p>Estacionamento próprio no local. Nossa equipe estará a postos ${d.eventStartTime ? `uma hora antes (a partir das ${escape(String(d.eventStartTime).slice(0, 2))}h)` : "antes do horário"}.</p>
        <p>Nos vemos lá — e que seja lindo! 🎉</p>
      `;
      return {
        subject: `Seu evento é amanhã — ${d.bookingCode}`,
        html: layout(title, body, business),
        text: `Seu evento ${d.bookingCode} é amanhã às ${d.eventStartTime}.`,
      };
    }
  }
}
