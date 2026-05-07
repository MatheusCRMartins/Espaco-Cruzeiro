# Espaço Cruzeiro — Site & Sistema de Reservas

Site institucional + funil de reservas com pagamento online e painel admin para o Espaço Cruzeiro (buffet em Osasco/SP).

## Stack

- **Next.js 16** (App Router, Turbopack default, React 19.2)
- **TypeScript 5** estrito
- **Tailwind CSS v4** + **shadcn/ui** (new-york)
- **Supabase** (Postgres + Auth + Storage + Realtime)
- **Drizzle ORM** (schema + migrations)
- **Mercado Pago** Checkout Pro (PIX, cartão, boleto)
- **Resend** + **React Email** (emails transacionais)
- **Zod** + **React Hook Form** (forms type-safe)
- **Motion** (animações)
- **date-fns / date-fns-tz** (timezone America/Sao_Paulo)

> ⚠️ Atenção: este projeto usa Next.js **16**. A middleware foi renomeada para
> `proxy` e APIs como `cookies()`, `headers()`, `params` e `searchParams` são
> assíncronas. Veja `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`.

## Setup inicial

```bash
# 1. Instalar dependências
npm install

# 2. Copiar env.example e preencher as credenciais
cp .env.example .env.local

# 3. Rodar migrações do banco (depois de configurar DATABASE_URL)
npm run db:generate   # gera SQL a partir do schema Drizzle
npm run db:migrate    # aplica as migrações
# ou: npm run db:push (para dev rápido, sem migrations versionadas)

# 4. Dev server
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Ver `.env.example`. Resumo do que é necessário:

| Grupo          | Variáveis                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| Supabase       | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Banco (Drizzle)| `DATABASE_URL` (connection string do Supabase — use o pooler de transação) |
| Mercado Pago   | `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`, `MERCADOPAGO_WEBHOOK_SECRET` |
| Email          | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`          |
| Site           | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`                      |

## Scripts

| Script                | Descrição                                     |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Dev server (Turbopack)                         |
| `npm run build`       | Build de produção                              |
| `npm run start`       | Serve o build                                  |
| `npm run lint`        | ESLint flat config                             |
| `npm run typecheck`   | `tsc --noEmit`                                 |
| `npm run db:generate` | Gera migrations a partir do schema Drizzle     |
| `npm run db:migrate`  | Aplica migrations no DATABASE_URL              |
| `npm run db:push`     | Sincroniza schema sem versionamento (dev)      |
| `npm run db:studio`   | UI para o banco                                |
| `npm run email:preview` | Preview dos templates React Email em dev    |

## Estrutura de pastas

```
/app
  /admin                  Painel administrativo (auth via proxy + guarda server)
    layout.tsx
    page.tsx              Dashboard
    sign-out-button.tsx
  /login                  Tela de login (e-mail + senha)
  /api
    /bookings             Reserva + disponibilidade (stub — fase 3)
    /leads                Formulário de lead
    /webhooks/mercadopago Webhook MP (stub — fase 3)
  layout.tsx              Root layout (fonts Fraunces + Manrope, metadata)
  page.tsx                Home placeholder
  globals.css             Design tokens + Tailwind v4 + shadcn vars
/lib
  /db                     Schema Drizzle + cliente postgres
  /supabase               Clients (browser / server / admin service-role)
  /notifications          Abstração NotificationService (email hoje, wa futuro)
  /mercadopago            Cliente SDK
  /validations            Schemas Zod compartilhados
  env.ts                  Validação das envs (server/client)
  utils.ts                cn(), formatBRL(), waLink()
/emails                   (a criar) Templates React Email
/components               (a criar) UI do site + admin
proxy.ts                  Auth refresh + guarda /admin (Next 16: substitui middleware)
drizzle.config.ts         Config do Drizzle Kit
components.json           Config shadcn/ui
```

## Auth admin

- Login via Supabase Auth (email + senha). Crie usuários no dashboard do Supabase.
- Para tornar alguém admin, adicione `role: "admin"` em `app_metadata` ou `user_metadata` do usuário (via SQL ou Admin API).
- O arquivo `proxy.ts` refresca a sessão em toda request e bloqueia `/admin/*` para quem não é admin.
- Defesa em profundidade: `app/admin/layout.tsx` revalida a permissão server-side.

## Roadmap

Ver **Seção 14 do briefing técnico**. Esta entrega corresponde à **Fase 1 — Foundation**:
scaffold completo, schema do banco, auth admin, layouts público e admin.
As fases seguintes (2–5) implementam o site público, o fluxo de reserva
com Mercado Pago, o painel admin completo e o refinamento final.

## Notas técnicas

- **Timezone**: tudo em `America/Sao_Paulo`. Datas de evento em `date`, horários em `time`, auditoria em `timestamptz`.
- **RLS**: configurar no Supabase depois das primeiras migrations. Escrita em `bookings`, `leads`, `content_blocks`, `notifications_log`, `admin_audit_log` só pelo admin autenticado; leitura pública apenas de `gallery_photos`, `testimonials` aprovadas, `event_types` ativos, `blocked_dates` e `availability_rules`.
- **Idempotência do webhook MP**: usar `payment_id` como chave única antes de aplicar transição de estado (já previsto no schema com unique index).
- **Soft lock**: campo `soft_lock_expires_at` em `bookings` — job de limpeza a ser adicionado na fase 3.
- **LGPD**: consent explícito nos forms (`consent: z.literal(true)`), honeypot (`website`), política e termos a publicar antes do go-live.
