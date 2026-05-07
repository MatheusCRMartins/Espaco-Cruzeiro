#!/usr/bin/env tsx
/**
 * Setup Supabase — aplica RLS policies + seed inicial.
 *
 * Idempotente: pode rodar quantas vezes quiser.
 *  - RLS:   DROP POLICY IF EXISTS / CREATE POLICY
 *  - Seed:  INSERT ... ON CONFLICT DO NOTHING
 *
 * Uso:
 *   npm run db:setup
 */
import { config as loadEnv } from "dotenv";
import postgres from "postgres";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL ausente. Configure .env.local antes de rodar.");
  process.exit(1);
}

const sql = postgres(url, { prepare: false });

const RLS_SQL = /* sql */ `
  -- 1) Habilita RLS em todas as tabelas (idempotente)
  ALTER TABLE event_types          ENABLE ROW LEVEL SECURITY;
  ALTER TABLE availability_rules   ENABLE ROW LEVEL SECURITY;
  ALTER TABLE blocked_dates        ENABLE ROW LEVEL SECURITY;
  ALTER TABLE bookings             ENABLE ROW LEVEL SECURITY;
  ALTER TABLE leads                ENABLE ROW LEVEL SECURITY;
  ALTER TABLE gallery_photos       ENABLE ROW LEVEL SECURITY;
  ALTER TABLE testimonials         ENABLE ROW LEVEL SECURITY;
  ALTER TABLE content_blocks       ENABLE ROW LEVEL SECURITY;
  ALTER TABLE notifications_log    ENABLE ROW LEVEL SECURITY;
  ALTER TABLE admin_audit_log      ENABLE ROW LEVEL SECURITY;
  -- business_settings adicionado depois — protege também
  ALTER TABLE IF EXISTS business_settings ENABLE ROW LEVEL SECURITY;

  -- 2) Policies de leitura pública — só o que aparece no site
  DROP POLICY IF EXISTS "public_read_active_event_types" ON event_types;
  CREATE POLICY "public_read_active_event_types"
    ON event_types FOR SELECT TO anon, authenticated
    USING (active = true);

  DROP POLICY IF EXISTS "public_read_active_availability_rules" ON availability_rules;
  CREATE POLICY "public_read_active_availability_rules"
    ON availability_rules FOR SELECT TO anon, authenticated
    USING (active = true);

  DROP POLICY IF EXISTS "public_read_blocked_dates" ON blocked_dates;
  CREATE POLICY "public_read_blocked_dates"
    ON blocked_dates FOR SELECT TO anon, authenticated
    USING (true);

  DROP POLICY IF EXISTS "public_read_approved_testimonials" ON testimonials;
  CREATE POLICY "public_read_approved_testimonials"
    ON testimonials FOR SELECT TO anon, authenticated
    USING (approved = true);

  DROP POLICY IF EXISTS "public_read_gallery_photos" ON gallery_photos;
  CREATE POLICY "public_read_gallery_photos"
    ON gallery_photos FOR SELECT TO anon, authenticated
    USING (true);

  DROP POLICY IF EXISTS "public_read_content_blocks" ON content_blocks;
  CREATE POLICY "public_read_content_blocks"
    ON content_blocks FOR SELECT TO anon, authenticated
    USING (true);

  -- business_settings: NAP e horários são públicos (já aparecem no site).
  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_settings') THEN
      DROP POLICY IF EXISTS "public_read_business_settings" ON business_settings;
      CREATE POLICY "public_read_business_settings"
        ON business_settings FOR SELECT TO anon, authenticated
        USING (true);
    END IF;
  END $$;

  -- bookings, leads, notifications_log, admin_audit_log:
  -- nenhuma policy = ninguém via PostgREST acessa.
  -- service_role (servidor) bypassa RLS por padrão.

  -- Partial unique index: previne race de duas reservas ativas
  -- (confirmed ou pending_payment) pra mesma data. INSERT do segundo
  -- lança SQLSTATE 23505 que app/api/bookings traduz em 409.
  -- Postgres não aceita now() em WHERE de partial index → app faz
  -- sweep de pending_payment com lock expirado antes do INSERT
  -- (lib/bookings/service.ts/sweepExpiredLocksForDate).
  CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_date_uq
    ON bookings (event_date)
    WHERE status IN ('confirmed', 'pending_payment');
`;

const SEED_SQL = /* sql */ `
  -- Tipos de evento (alinhado com lib/mock/event-types.ts)
  INSERT INTO event_types (slug, name, description, base_price_per_person, min_guests, max_guests, duration_hours, display_order, active)
  VALUES
    ('casamentos',        'Casamentos',          'Cerimônia e recepção no mesmo espaço.',           250.00, 50, 150, 8, 1, true),
    ('aniversarios',      'Aniversários',        'Festas infantis e celebrações de adultos.',       180.00, 30, 150, 6, 2, true),
    ('cha-de-bebe',       'Chá de bebê',         'Brunch acolhedor para celebrar a chegada.',       150.00, 20,  80, 5, 3, true),
    ('revelacao',         'Chá revelação',       'Reveal coordenado com efeitos especiais.',        160.00, 20,  80, 4, 4, true),
    ('corporativos',      'Eventos corporativos','Confraternizações, lançamentos e treinamentos.',  140.00, 30, 150, 6, 5, true),
    ('confraternizacoes', 'Confraternizações',   'Fim de ano, aniversário da empresa, reencontros.',170.00, 30, 150, 6, 6, true)
  ON CONFLICT (slug) DO NOTHING;

  -- Regras semanais (0=Dom, 1=Seg, ..., 6=Sáb)
  INSERT INTO availability_rules (weekday, start_time, end_time, active) VALUES
    (5, '18:00:00', '23:00:00', true),
    (6, '12:00:00', '23:00:00', true),
    (0, '12:00:00', '22:00:00', true)
  ON CONFLICT DO NOTHING;

  -- Depoimentos aprovados (do mock)
  INSERT INTO testimonials (customer_name, rating, content, event_date, approved, display_order) VALUES
    ('Carolina & Rafael', 5, 'A equipe cuidou de cada detalhe do nosso casamento. Nossos convidados ainda comentam da comida e da estrutura. Valeu cada centavo.', '2025-09-15', true, 1),
    ('Juliana S.',         5, 'Meu filho amou, e as crianças nem queriam ir embora. Decoração linda, atendimento impecável. Já estamos planejando o próximo!',           '2025-07-20', true, 2),
    ('Marina & Pedro',     5, 'O reveal ficou absolutamente perfeito. Coordenaram tudo com a gente e ainda deram várias dicas que a gente não tinha pensado.',         '2025-05-10', true, 3),
    ('Equipe Horizonte',   5, 'Fizemos nossa festa de fim de ano e foi o melhor evento da empresa em anos. Estrutura, comida e atendimento excelentes.',                '2024-12-12', true, 4),
    ('Fernanda M.',        5, 'Ambiente delicado, brunch delicioso e uma atenção enorme comigo e com minhas convidadas. Foi o dia mais especial.',                      '2025-04-05', true, 5),
    ('Lucas & Beatriz',    5, 'Buscamos vários lugares em Osasco e escolhemos o Espaço Cruzeiro pelo carinho no atendimento. Não nos arrependemos nenhum segundo.',     '2025-02-22', true, 6)
  ON CONFLICT DO NOTHING;
`;

async function main() {
  try {
    console.log("→ Aplicando RLS policies...");
    await sql.unsafe(RLS_SQL);
    console.log("✓ RLS aplicado.\n");

    console.log("→ Aplicando seed inicial...");
    await sql.unsafe(SEED_SQL);
    console.log("✓ Seed aplicado.\n");

    console.log("→ Verificando contagens:");
    const counts = await sql<Array<{ table_name: string; count: bigint }>>`
      SELECT 'event_types' AS table_name, count(*)::bigint FROM event_types
      UNION ALL SELECT 'availability_rules', count(*)::bigint FROM availability_rules
      UNION ALL SELECT 'testimonials',       count(*)::bigint FROM testimonials
      UNION ALL SELECT 'bookings',           count(*)::bigint FROM bookings
      UNION ALL SELECT 'leads',              count(*)::bigint FROM leads
    `;
    for (const row of counts) {
      console.log(`  ${row.table_name.padEnd(20)} ${row.count}`);
    }
    console.log("\n✓ Setup completo.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("✗ Erro:", err);
  process.exit(1);
});
