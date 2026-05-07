# 🤝 HANDOFF — Espaço Cruzeiro

> **Como usar este arquivo:** abra um novo chat com Claude (qualquer modelo Opus/Sonnet),
> e a primeira coisa que mande seja:
>
> > _"Leia o arquivo `HANDOFF.md` em `C:\Users\Matheus Martins\Desktop\espaco-cruzeiro\HANDOFF.md`. Ele contém tudo o contexto do projeto. Depois de ler, me confirme em 3 linhas que entendeu, e aguarde minhas próximas instruções."_
>
> Ou cole o conteúdo deste arquivo direto no chat.

---

## 1. TL;DR (em 5 linhas)

Sou Matheus, dono do projeto. Comprei um Claude pra desenvolver um **site + sistema de reservas online** pra um buffet em Osasco/SP chamado **Espaço Cruzeiro** (cliente Belari). Stack: **Next.js 16 + Supabase + Drizzle + Mercado Pago + Resend**. O projeto está **funcional, com painel admin completo** (12 áreas), **segurança reforçada** após pente fino sênior, e **rodando localmente em `localhost:3000`**. **37+ commits no GitHub**: https://github.com/MatheusCRMartins/Espaco-Cruzeiro. Próximas decisões são: configurar Mercado Pago real, Resend, deploy Vercel, e — possivelmente — refatorar pra **multi-tenant SaaS** vendendo pra outros buffets.

---

## 2. Quem sou (perfil do dev/cliente)

- **Nome**: Matheus Martins
- **Email**: `mrmtec14@gmail.com`
- **GitHub**: [MatheusCRMartins](https://github.com/MatheusCRMartins)
- **Empresa proprietária**: Belari (cliente final é o Espaço Cruzeiro buffet)
- **Sou júnior em Next.js/Supabase**, mas estou aprendendo. Prefiro:
  - Explicações **didáticas** quando o tópico é novo (Supabase, MP, deploy, etc.)
  - Código **direto e profissional** quando é só pra avançar
  - **Commits pequenos e lógicos** versus 1 commit gigante
  - **Senior engineer voice** — "qual a opção mais profissional, e por quê"
  - **Confirmação antes de push e ações destrutivas** (deletar, force-push, drops, etc.)

---

## 3. Estado comercial e estratégico

- **Proposta de R$ 18.000** já fechada com Belari (1 cliente único). 3 parcelas (40/30/30%).
  - Briefing: `briefing/BRIEFING_ESPACO_CRUZEIRO.docx`
  - Proposta: `pdfs/02_proposta_comercial.pdf`
  - Doc técnica: `pdfs/03_documentacao_tecnica.pdf`
  - Guia passo-a-passo: `pdfs/01_guia_passo_a_passo.pdf`
- **Possibilidade aberta**: virar **produto SaaS pra outros buffets** (~5-10k buffets ativos no BR; mercado fragmentado; ~10 concorrentes existentes mas todos focam em ERP backend e ignoram a frente "site bonito + admin"). Análise completa de mercado foi feita no chat anterior — se for retomar essa frente, pedir resumo do "Modelo B — white-label site bonito + admin".

---

## 4. Stack e arquitetura

### Tech
- **Frontend/server**: Next.js 16 (App Router, Server Actions, Turbopack), React 19.2, TypeScript estrito
- **Estilo**: Tailwind CSS v4 + shadcn/ui (new-york), design tokens oklch (verde `#1d3a2c` + dourado `#d6b067` + creme `#f6f1e5`)
- **DB**: Postgres (Supabase) + **Drizzle ORM** + migrations versionadas em `lib/db/migrations`
- **Auth**: Supabase Auth (email/senha) com `app_metadata.role = "admin"` pro painel
- **Pagamento**: Mercado Pago Checkout Pro (PIX/cartão/boleto). Webhook idempotente com HMAC + anti-replay timestamp
- **Email**: Resend + templates HTML inline (8 templates)
- **Storage**: Supabase Storage bucket `public-assets` com upload server-side
- **Validation**: Zod 4 em todas as actions/APIs
- **Editores**: Tiptap (rich text em content_blocks) + @dnd-kit (drag-and-drop reorder)
- **Toasts**: sonner
- **Datas**: date-fns + date-fns-tz (America/Sao_Paulo)

### Convenções importantes
- **Next 16: middleware foi renomeada para `proxy`** — arquivo é `proxy.ts` na raiz, runtime nodejs
- **`cookies()`, `headers()`, `params`, `searchParams` são async** em Next 16
- **Server Actions retornam estado tipado** com `useActionState` — feedback de erro inline + toast via sonner
- **Cache process-memory** com TTL de 30-60s em `getBusinessSettings`, `getContentBlock`, `getGalleryPhotos`, `getProofOfLife` (vai precisar trocar pra `unstable_cache` + `revalidateTag` quando rodar multi-instance — anotado em dívida técnica)
- **DEV_ADMIN_BYPASS=1** no `.env.local` injeta admin fake (hard-guarded contra production em `proxy.ts` e `lib/supabase/server.ts`). **Está OFF agora** porque o Supabase real está conectado.

---

## 5. Localização e acessos

### Sistema
- **Pasta primária**: `C:\Users\Matheus Martins\Desktop\espaco-cruzeiro`
- **Pasta secundária** (scripts python de clima Belari, **NÃO MEXER**): `C:\Users\Matheus Martins\Desktop\climas`
- **Shell**: bash (use sintaxe Unix). PowerShell também disponível.
- **OS**: Windows 11

### Git / GitHub
- **Repo**: https://github.com/MatheusCRMartins/Espaco-Cruzeiro
- **Branch**: `main` (renomeada de `master` no início)
- **Remote**: `origin` configurado
- **`git config user.name`**: "Matheus Martins"
- **`git config user.email`**: `mrmtec14@gmail.com`

### Supabase
- **Projeto**: `nstlwiymbhwcdgqgeanm` (região `sa-east-1` São Paulo)
- **URL**: `https://nstlwiymbhwcdgqgeanm.supabase.co`
- **Credenciais reais** estão em `.env.local` (gitignored). NÃO repassar credenciais em chat — usar [onetimesecret.com](https://onetimesecret.com) se precisar transferir.
- **Bucket Storage**: `public-assets` (público)
- **Admin user criado**:
  - Email: `mrmtec14@gmail.com`
  - Senha: **gerada aleatoriamente em `npm run db:create-admin`** — Matheus tem ela guardada (ou pode regerar com a mesma senha via env var `ADMIN_PASSWORD=...` no comando)
  - User ID: `f0e9c561-c70f-4c45-a888-2fc5a5396f6a`
- **⚠️ DÍVIDA DE SEGURANÇA**: a `service_role key` foi colada no chat anterior. **Antes de ir pra prod, regere o JWT secret no painel Supabase** (Project Settings → API → Generate new JWT secret) e atualize o `.env.local`.

### Mercado Pago / Resend / Vercel
- **NÃO configurados ainda.** Vars vazias em `.env.local`. Quando configurar:
  - Obter `MERCADOPAGO_ACCESS_TOKEN` (sandbox primeiro)
  - Configurar webhook no painel MP apontando pra `${SITE_URL}/api/webhooks/mercadopago`
  - Verificar domínio no Resend antes de mandar e-mails reais
  - Deploy: Vercel (importar do GitHub, configurar envs)

---

## 6. Estrutura do projeto

```
espaco-cruzeiro/
├── app/
│   ├── (site)/              # rotas públicas (com layout próprio)
│   │   ├── layout.tsx       # SiteHeader + SiteFooter + WhatsAppFloat + JsonLd
│   │   ├── page.tsx         # home com 9 seções
│   │   ├── sobre/, contato/ (Server Action insere lead),
│   │   ├── eventos/[slug]/  # gera estaticamente os 6 tipos
│   │   ├── reservar/        # 5 steps + calendar-picker + sucesso/pendente/erro
│   │   ├── visita/          # NOVO — agendar visita ao espaço (3 steps)
│   │   ├── politica-de-privacidade/, termos-de-uso/, politica-de-cancelamento/
│   ├── admin/               # painel autenticado
│   │   ├── layout.tsx       # guard server-side + AdminShell
│   │   ├── admin-shell.tsx  # client — sidebar (12 itens) + drawer mobile + Toaster
│   │   ├── _lib/{guard,audit}.ts
│   │   ├── page.tsx         # dashboard com 4 KPIs
│   │   ├── calendario/
│   │   ├── reservas/        # lista + [id] (detalhe com ações destrutivas confirmadas) + manual/ (gera link MP+WA)
│   │   ├── visitas/         # NOVO
│   │   ├── leads/
│   │   ├── disponibilidade/ # CRUD regras semanais + bloqueios
│   │   ├── tipos-evento/    # CRUD completo + drag-and-drop
│   │   ├── galeria/         # upload nativo com preview
│   │   ├── depoimentos/, conteudo/ (Tiptap), cupons/
│   │   ├── comunicacoes/    # NOVO — log de e-mails
│   │   ├── auditoria/       # NOVO — admin_audit_log com filtros
│   │   ├── configuracoes/   # NOVO — editor completo de business_settings
│   ├── api/
│   │   ├── bookings/{route,[id]/route,availability/route}.ts
│   │   ├── leads/route.ts (rate-limit)
│   │   ├── coupons/validate/route.ts (NOVO, anti-enumeration)
│   │   ├── webhooks/mercadopago/route.ts (HMAC+anti-replay+race-safe)
│   │   ├── cron/reminders/route.ts (D-7, D-1, cart abandonment)
│   │   └── admin/export/route.ts (CSV)
│   ├── login/{page,login-form,actions}.ts (Server Action com rate-limit)
│   ├── opengraph-image.tsx, robots.ts, sitemap.ts (com /visita), globals.css
├── components/
│   ├── site/                # public components
│   │   ├── site-header.tsx (client, recebe businessName via prop)
│   │   ├── site-footer.tsx (server, async)
│   │   ├── whatsapp-float.tsx (client)
│   │   ├── json-ld.tsx (server, async)
│   │   ├── legal-page.tsx
│   │   ├── gallery-grid.tsx (NOVO — lightbox com focus trap)
│   │   └── sections/{hero,social-proof,the-space,event-types-grid,how-it-works,budget-calculator,testimonials,faq,final-cta}.tsx
│   ├── ui/
│   │   ├── button.tsx, input.tsx, card.tsx, container.tsx, accordion.tsx
│   │   └── confirm-dialog.tsx (NOVO — modal "digite EXCLUIR" com focus trap)
│   └── admin/
│       └── rich-text-editor.tsx (NOVO — Tiptap wrapper)
├── lib/
│   ├── db/{schema.ts,index.ts,migrations/}
│   ├── supabase/{server,client,admin}.ts
│   ├── env.ts (Zod-validated, normaliza empty strings → undefined)
│   ├── utils.ts, constants.ts (apenas NAV_LINKS+LEGAL_LINKS)
│   ├── business-settings/   # NOVO — substitui constants.BUSINESS hardcoded
│   ├── content/             # NOVO — registry tipado + sanitize HTML
│   ├── gallery/             # NOVO — getGalleryPhotos com cache
│   ├── coupons/             # NOVO — checkCoupon + reserveCouponUse atomic
│   ├── visits/              # NOVO — slots disponíveis ter-sáb
│   ├── csv/                 # NOVO — toCsv com BOM UTF-8
│   ├── rate-limit/          # NOVO — sliding window in-memory
│   ├── storage/             # NOVO — wrappers de upload Supabase
│   ├── notifications/{index,email-adapter,templates,types}.ts
│   ├── bookings/service.ts (sweepExpiredLocksForDate ADICIONADO)
│   ├── availability/index.ts (slot-time validation + getProofOfLife)
│   ├── mercadopago/{client,preference,webhook}.ts
│   ├── validations/{common,lead,booking}.ts
│   └── mock/{event-types,faqs,testimonials}.ts (legado — site agora puxa do banco)
├── scripts/
│   ├── setup-supabase.ts (RLS + seed + partial unique index)
│   ├── setup-storage.ts (cria bucket public-assets)
│   ├── create-admin.ts (Auth Admin API)
│   ├── verify-setup.ts (smoke test do estado do banco)
│   └── test-rls.ts (13 probes de RLS com anon key)
├── briefing/, pdfs/         # docs comerciais
├── public/                  # SVGs default Next
├── proxy.ts                 # middleware Next 16 — só /admin e /api/admin agora
├── drizzle.config.ts        # carrega .env.local primeiro
├── package.json             # scripts: dev, build, typecheck, db:*
├── next.config.ts           # remotePatterns dinâmico do Supabase
├── vercel.json              # cron diário 12:00 UTC pra /api/cron/reminders
├── components.json          # shadcn config
├── tsconfig.json, eslint.config.mjs, postcss.config.mjs
├── .env.example, .env.local (gitignored)
├── .gitignore
├── README.md
└── HANDOFF.md (este arquivo)
```

---

## 7. Tudo que foi entregue (resumo executivo de 4 ondas + pente fino)

### ✅ Onda 1 — Foundation operacional
- **`business_settings`** table singleton + admin editor + site consumindo (substitui `constants.BUSINESS` hardcoded)
- **CRUD completo de tipos de evento**: edit, delete (com FK protection), toggle inline, **drag-and-drop reorder** com @dnd-kit
- **Upload de imagens nativo** via Supabase Storage (até 10MB), preview local, thumbs reais via `<Image>`

### ✅ Onda 2 — Conteúdo + Segurança
- **Tiptap** (rich text) em `content_blocks` com 4 chaves tipadas (home.hero, home.the_space, home.final_cta, faq.items). Site público lê do banco com fallback nos defaults.
- **Sanitização HTML** allowlist antes de salvar (defesa em profundidade contra XSS)
- **Rate-limit** em `/login`, `/api/leads`, `/api/coupons/validate`, `/api/bookings`, `/api/bookings/availability`
- **Login virou Server Action** (cookies server-side, anti-bruteforce)
- **Modal de confirmação dupla** (`<ConfirmDialog confirmPhrase="EXCLUIR">`) em todos os deletes destrutivos
- **Script `db:test-rls`** validando 13 probes de RLS automaticamente

### ✅ Onda 3 — Visibilidade
- **`/admin/auditoria`** — viewer do `admin_audit_log` com 22 ações mapeadas em pt-BR + diff JSON expansível
- **`/admin/comunicacoes`** — viewer do `notifications_log` com KPIs (total/enviadas/falhas)
- **Export CSV** de reservas e leads (`/api/admin/export?type=...`) com BOM UTF-8 (Excel BR)
- **Sonner toasts** em todos os fluxos de mutação
- **Mobile sidebar drawer** no admin (responsivo)

### ✅ Onda 4 — Diferenciais "bala"
- **Proof-of-life dinâmico no hero** — "Apenas 4 sábados livres em junho" puxado do banco com cache de 60s
- **Galeria com lightbox** A11y completo (ESC, ←/→ nav, focus trap)
- **Cupons** — schema + CRUD admin + endpoint público de validação anti-enumeration + integração no checkout (sidebar mostra desconto + total recalculado)
- **Reserva manual no admin** — gera booking + link MP + mensagem WhatsApp pré-formatada em 1 clique
- **Agendar visita** (`/visita`) — 3 steps com calendário de slots livres (ter-sáb, hardcoded por enquanto) + admin `/admin/visitas`
- **Cart abandonment recovery** — cron envia e-mail pra bookings em pending_payment há 2-24h

### ✅ Pente fino sênior (3 reviews paralelos + fixes)
**Segurança:**
- Proxy matcher reduzido pra só `/admin/:path*` e `/api/admin/:path*`
- Coupon enumeration fechada (mensagem genérica única)
- Webhook MP anti-replay (janela de 5min)
- CORS check em `/api/bookings`
- Rate-limit em endpoints públicos faltantes

**Lógica/correção:**
- **Race em booking resolvida**: partial unique index `bookings_active_date_uq` + `sweepExpiredLocksForDate` + handler 409 no INSERT
- **Race em cupom resolvida**: `reserveCouponUse` atomic UPDATE-RETURNING ANTES do INSERT, `releaseCouponUse` rollback
- **Slot fora da janela bloqueado** server-side
- **`forceConfirmBooking`** com paymentId único `manual-${bookingId}` (era "manual" hardcoded)
- **Webhook MP race resolvida** (UPDATE WHERE pending_payment evita duplicação de e-mails)
- **Upserts atômicos** (business_settings + content_blocks via `onConflictDoUpdate`)

**A11y/UX:**
- Focus trap em ConfirmDialog e GalleryGrid
- aria-label natural no calendar-picker
- autoComplete em forms públicos

---

## 8. Como rodar local (do zero, ou após fresh clone)

```bash
# 1. Clonar e instalar
cd "C:/Users/Matheus Martins/Desktop"
git clone https://github.com/MatheusCRMartins/Espaco-Cruzeiro.git espaco-cruzeiro
cd espaco-cruzeiro
npm install

# 2. Configurar .env.local (copiar de .env.example)
#    Preencher: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#    SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL (transaction pooler porta 6543),
#    NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 3. Aplicar migrations no Supabase
npm run db:generate    # gera SQL a partir do schema.ts (idempotente)
npm run db:migrate     # aplica no banco

# 4. Configurar bucket de Storage
npm run db:setup-storage    # cria bucket public-assets

# 5. Configurar RLS + seed inicial
npm run db:setup    # idempotente — pode rodar várias vezes

# 6. Criar usuário admin
ADMIN_EMAIL=mrmtec14@gmail.com npm run db:create-admin
#    Senha gerada aleatoriamente é mostrada UMA vez — guardar imediatamente

# 7. Validar tudo
npm run db:verify       # contagem de tabelas + admin com role correto
npm run db:test-rls     # 13 probes de RLS

# 8. Rodar dev server
npm run dev    # http://localhost:3000

# 9. Smoke test no navegador:
#    /                           → home com hero
#    /reservar                   → 6 tipos de evento + calendário
#    /visita                     → 3-step de agendamento
#    /login                      → fazer login com admin
#    /admin                      → dashboard
#    /admin/configuracoes        → editar NAP/horários/redes
#    /admin/tipos-evento         → drag-and-drop reorder
#    /admin/galeria              → upload de foto
#    /admin/cupons               → criar BLACK20 e testar
#    /admin/reservas/manual      → gerar link MP + WhatsApp
```

---

## 9. Scripts npm disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server (Turbopack, daemon mode no Next 16) |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Drizzle: gera SQL a partir do schema.ts |
| `npm run db:migrate` | Drizzle: aplica migrations |
| `npm run db:push` | Drizzle: sync sem versionar (só dev) |
| `npm run db:studio` | Drizzle Studio UI |
| `npm run db:setup` | Aplica RLS + seed + partial unique index (idempotente) |
| `npm run db:setup-storage` | Cria bucket public-assets (idempotente) |
| `npm run db:create-admin` | Cria/promove user admin via Auth Admin API |
| `npm run db:verify` | Smoke test: contagens + admin role + RLS policies |
| `npm run db:test-rls` | 13 probes de RLS com anon key |
| `npm run email:preview` | Preview templates React Email (não usado ainda; templates atuais são HTML inline) |

### Logs do dev server
Next 16 roda em **daemon**. Logs ficam em `.next/dev/logs/next-development.log`. Use:
```bash
tail -50 .next/dev/logs/next-development.log
```

---

## 10. Dívida técnica conhecida (anotada nos commits, NÃO esquecida)

Em ordem de prioridade pra produção:

1. **Trocar sanitizer regex por `isomorphic-dompurify`** (`lib/content/sanitize.ts`) — output do Tiptap atual é seguro, mas DOMPurify é defesa de verdade
2. **Magic-byte check** em upload de imagens (`lib/storage/index.ts`) — atualmente confia no MIME do client
3. **CPF DV validation** (`lib/validations/common.ts`) — só checa 11 dígitos hoje
4. **Cache cross-instance** com `unstable_cache` + `revalidateTag` em `getBusinessSettings/getContentBlock/getGalleryPhotos/getProofOfLife` — atual é process-memory, vai falhar em multi-region da Vercel
5. **React `cache()`** nas funções de leitura pra dedupe de fetches por request
6. **Timezone DST-safe** com `date-fns-tz America/Sao_Paulo` — atual UTC-3 hardcoded em `lib/visits/index.ts` quebra se Brasil voltar c/ horário de verão
7. **Rate-limit Upstash** (`lib/rate-limit/index.ts`) — in-memory funciona em single-instance, não em Vercel multi-region
8. **2FA admin** com TOTP
9. **Logs com PII** sanitizar antes de `console.error` em endpoints públicos (alguns ainda passam o erro cru)
10. **Stepper labels visíveis em mobile** + máscaras de input (CPF/telefone) em `/reservar`
11. **NF-e/NFS-e automática** via Focus NFe ou similar (cliente vai pedir)
12. **App mobile nativo** (PWA já dá; nativo seria upgrade)
13. **CRM com funil kanban** em `/admin/leads` (pra paridade com BuffetMais)
14. **Cardápio + ficha técnica + lista de compras** (pra paridade com ProBuffet)
15. **RSVP de convidados** (pra paridade com GestãoFesta)
16. **Cron mais agressivo pro cart recovery** (atual 1x/dia; ideal 4x/dia)
17. **Lighthouse audit** completo + correções

---

## 11. Decisões importantes (não mudar sem alinhar)

- **Single-tenant por enquanto.** Multi-tenant é refactor grande (4 semanas). Adicionar `tenant_id` em **todas** as tabelas de cliente, middleware resolve subdomínio → tenant, RLS filtra por tenant_id. **Só fazer se decidir partir pro modelo SaaS B (white-label).**
- **`lib/constants.ts`** só guarda **NAV_LINKS** e **LEGAL_LINKS**. Tudo do negócio (NAP, horários, redes, política, stats) está em `business_settings` no banco.
- **Mocks em `lib/mock/*`** são **fallback de defaults** quando o banco não tem dado. Site público lê do banco; só cai nos mocks em emergência.
- **Templates de e-mail são HTML inline** em `lib/notifications/templates.ts`. React Email está instalado mas não usado — refactor possível mas não prioritário.
- **`forceConfirmBooking` usa `paymentId="manual-${bookingId}"`** — não trocar por uma string fixa, isso violaria o `bookings_payment_id_uq`.
- **`bookings_active_date_uq`** é um **partial unique index** aplicado via `db:setup` (não via migrations Drizzle, porque Postgres não aceita `now()` em partial index). Antes do INSERT em `/api/bookings`, **sempre rodar `sweepExpiredLocksForDate(eventDate)`** pra liberar locks vencidos.
- **`reserveCouponUse` ANTES do INSERT** + **`releaseCouponUse` se INSERT falhar**. Não usar mais `incrementCouponUse` (deprecated alias).

---

## 12. Próximos ciclos prováveis (ordem de probabilidade)

1. **Configurar Mercado Pago em sandbox** — testar fluxo de reserva real
   - Criar conta MP com CNPJ do cliente
   - Pegar `MERCADOPAGO_ACCESS_TOKEN` (test) + `MERCADOPAGO_PUBLIC_KEY` (test)
   - Configurar webhook secret + URL no painel MP
   - Testar fluxo `/reservar` end-to-end com cartão de teste
2. **Configurar Resend** — verificar domínio + templates rodando
3. **Deploy Vercel** — importar repo, configurar envs, custom domain quando pronto
4. **Cliente fornecer dados reais** (CNPJ, fotos, depoimentos, política de cancelamento exata) — antes de ir live
5. **Pagar dívida técnica top 5** acima
6. **(Decisão estratégica)** virar SaaS multi-tenant pra outros buffets

---

## 13. Como me instruir no novo chat (preferências de Matheus)

- **Tom:** senior software engineer especializado em **CRO/UX/responsividade**
- **Quando der opções:** sempre marcar qual é a "mais profissional pensada por um engenheiro" e **explicar o porquê** — não enumerar opções neutras
- **Commits:** pequenos e lógicos (~1 conceito por commit), mensagens em estilo conventional commits em pt-BR, com `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
- **Push:** Matheus usa Windows Credential Manager; primeiro push da sessão, perguntar antes; depois pode pushar livre
- **Ações destrutivas** (delete, force-push, drops, deploy prod, etc.): **sempre confirmar antes**
- **Senha do admin / credenciais:** quando precisar passar, sugerir [onetimesecret.com](https://onetimesecret.com) ao invés de chat direto
- **Modo de trabalho:** Matheus disse "mete bronca, faça tudo, não quero que vc fique pedindo permição". Mas continue **confirmando ações irreversíveis** — autorização ampla não cobre risco operacional.
- **Plan mode:** se Matheus ativar (`/plan` ou similar), respeite — escreva o plano e use `ExitPlanMode`
- **Reportar progresso:** updates curtos a cada 3-5 commits ou milestones lógicos
- **Não use emojis no código** (a menos que ele peça); pode usar moderadamente em respostas de chat
- **Linguagem:** português brasileiro casual e direto

---

## 14. Memórias persistentes do Claude (já gravadas)

Em `C:\Users\Matheus Martins\.claude\projects\C--Users-Matheus-Martins-Desktop-climas\memory\`:

- `MEMORY.md` — índice
- `user_role_and_workflow.md` — Matheus quer Claude como senior CRO/UX/responsive; commits vão pro GitHub
- `feedback_decision_style.md` — sempre marcar a opção "mais profissional" e explicar
- `reference_github_repo.md` — URL do repo
- `reference_formspree.md` — Matheus mandou um Formspree no início achando que era banco; Claude esclareceu que é só form backend (não é usado no projeto)

Se essas memórias não carregarem no novo chat, é só o Claude novo recriar lendo este HANDOFF.

---

## 15. Histórico de commits (o que cada um fez)

```
6d8a755  fix: pente fino senior — security, race conditions, a11y, UX
96481b3  feat: agendar visita público + cart abandonment recovery no cron
4a53bfc  feat(admin): reserva manual com link de pagamento + WhatsApp em 1 clique
223cece  feat(coupons): cupons de desconto no checkout + admin completo
afcc32f  feat(home): proof-of-life dinâmico no hero + galeria com lightbox
2fde651  feat(storage): bucket public-assets + upload nativo na galeria
b8b53fd  feat(admin): CRUD completo de tipos de evento — edit, delete, toggle, reorder
620e15c  feat(admin): /admin/configuracoes editável com useActionState
089600b  feat(site): site público consome business_settings em vez de constants.ts
7f09b58  feat(settings): business_settings table + lib + integração com notifications
bfbf0f7  feat(admin): viewers de auditoria/comunicações + export CSV
8560db7  feat(ux): sonner toasts + sidebar admin responsivo + correção test-rls
a048a3f  feat(content): rich-text editor + content_blocks tipados; site consome do banco
75183ca  feat(security): RLS em business_settings + script de smoke test
67ed2a2  feat(ui): modal de confirmação dupla pra ações destrutivas
a329e2f  feat(security): rate-limit no /api/leads e login (Server Action)
d00319c  fix(env): normalizar strings vazias e logar issues do Zod 4
9c7fa9e  feat(scripts): setup-supabase, create-admin e verify-setup
8a23516  feat(db): drizzle carrega .env.local e migration inicial gerada
5131cc1  fix(admin): wrap server actions usadas em <form action> pra Next 16
3fd32bf  chore: ignore Python bytecode (pycache, .pyc, .pyo)
138c384  docs: briefing, materiais comerciais, doc técnica e README
47b0ddc  chore(seo): sitemap, robots e OpenGraph image
f7b8b64  feat(admin): painel administrativo com 10 áreas
e08b390  feat(api): bookings, availability, leads, MP webhook e cron lembretes
960cc56  feat(site): inner pages — sobre, contato, eventos/[slug], legais e fluxo de reserva
473b558  feat(site): public layout, UI primitives and home sections
7eeda01  feat(auth): Next.js 16 proxy + Supabase login for /admin
928fade  feat(lib): foundation libs — db, supabase, MP, notifications, validations
b5b5420  feat(ui): design tokens, fonts and root layout
9ab0f1b  chore: configure project deps, drizzle, vercel cron and env example
794e452  Initial commit from Create Next App
```

Para ver o que mudou em qualquer commit:
```bash
git show <hash>      # diff completo
git show <hash> --stat   # só lista de arquivos
```

---

## 16. ⚡ Cheatsheet — comandos que você vai usar mais

```bash
# Trabalhar
cd "C:/Users/Matheus Martins/Desktop/espaco-cruzeiro"
npm run dev                    # http://localhost:3000

# Logs do daemon
tail -50 .next/dev/logs/next-development.log

# Smoke test rápido
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/reservar
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin

# Banco
npm run db:verify              # estado do banco
npm run db:test-rls            # validar RLS

# Após mudar schema.ts
npm run db:generate
npm run db:migrate

# Após criar/editar policies de RLS ou seed em scripts/setup-supabase.ts
npm run db:setup               # idempotente

# Git
git status
git log --oneline -10
git push origin main

# Type-check
npm run typecheck
```

---

## 17. Como continuar daqui — mensagem-tipo pro próximo chat

Cole isto no novo chat depois de pedir pra ler o HANDOFF:

> "Lê o HANDOFF.md em `C:\Users\Matheus Martins\Desktop\espaco-cruzeiro\HANDOFF.md`. Depois me confirme em 3 linhas que entendeu, e me diga: (a) qual o estado atual do projeto, (b) o que está pendente, e (c) sugira o próximo passo mais profissional. Vou seguir suas recomendações."

Aí o Claude novo lê, sintetiza, e sugere o próximo movimento (provavelmente: configurar MP sandbox, ou pagar dívida técnica top 5, ou começar refactor multi-tenant se for SaaS).

---

**Última atualização:** 2026-05-07 (final da sessão de 37 commits que entregou ondas 1-4 + pente fino sênior).

— Claude Opus 4.7 (1M context)
