import { getBusinessSettings } from "@/lib/business-settings";

import { BusinessSettingsForm } from "./business-settings-form";

export const metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getBusinessSettings();

  const envChecks = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { key: "SUPABASE_SERVICE_ROLE_KEY", value: process.env.SUPABASE_SERVICE_ROLE_KEY },
    { key: "DATABASE_URL", value: process.env.DATABASE_URL },
    { key: "MERCADOPAGO_ACCESS_TOKEN", value: process.env.MERCADOPAGO_ACCESS_TOKEN },
    { key: "MERCADOPAGO_WEBHOOK_SECRET", value: process.env.MERCADOPAGO_WEBHOOK_SECRET },
    { key: "RESEND_API_KEY", value: process.env.RESEND_API_KEY },
    { key: "RESEND_FROM_EMAIL", value: process.env.RESEND_FROM_EMAIL },
    { key: "NEXT_PUBLIC_SITE_URL", value: process.env.NEXT_PUBLIC_SITE_URL },
    { key: "CRON_SECRET", value: process.env.CRON_SECRET },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Tudo que aparece no site público vem daqui — header, footer, página de contato,
          schema.org de SEO local e templates de e-mail. Mudanças refletem em até 30 segundos.
        </p>
      </div>

      <BusinessSettingsForm initial={settings} />

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-semibold">Variáveis de ambiente</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Variáveis marcadas como <strong>faltando</strong> impedem certas funcionalidades
          (pagamento, e-mails, cron). Configure no painel da Vercel — não pelo painel admin.
        </p>
        <ul className="mt-4 divide-y divide-border text-sm">
          {envChecks.map((e) => (
            <li key={e.key} className="flex items-center justify-between py-2">
              <code className="font-mono text-xs">{e.key}</code>
              {e.value ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs text-emerald-900">
                  configurado
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-900">
                  faltando
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
