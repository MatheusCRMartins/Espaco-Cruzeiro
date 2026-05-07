#!/usr/bin/env tsx
/**
 * Verificação rápida do setup: contagem de seed + admin com role correto.
 * Rode após db:setup e db:create-admin pra confirmar tudo.
 *
 *   npm run db:verify
 */
import { config as loadEnv } from "dotenv";
import postgres from "postgres";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL ausente.");
  process.exit(1);
}

const sql = postgres(url, { prepare: false });

async function main() {
  try {
    console.log("→ Contagens:");
    const counts = await sql<Array<{ table_name: string; count: bigint }>>`
      SELECT 'event_types' AS table_name, count(*)::bigint FROM event_types
      UNION ALL SELECT 'availability_rules', count(*)::bigint FROM availability_rules
      UNION ALL SELECT 'testimonials',       count(*)::bigint FROM testimonials
      UNION ALL SELECT 'bookings',           count(*)::bigint FROM bookings
      UNION ALL SELECT 'leads',              count(*)::bigint FROM leads
    `;
    for (const r of counts) console.log(`  ${r.table_name.padEnd(20)} ${r.count}`);

    console.log("\n→ Users com role admin:");
    const admins = await sql<Array<{ email: string; role: string | null; id: string }>>`
      SELECT
        email,
        (raw_app_meta_data->>'role') AS role,
        id::text
      FROM auth.users
      WHERE (raw_app_meta_data->>'role') = 'admin'
    `;
    if (admins.length === 0) {
      console.log("  (nenhum admin encontrado)");
    } else {
      for (const a of admins) console.log(`  ${a.email}  role=${a.role}  id=${a.id}`);
    }

    console.log("\n→ Policies RLS:");
    const policies = await sql<Array<{ tablename: string; policyname: string }>>`
      SELECT tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `;
    if (policies.length === 0) {
      console.log("  ⚠️  Nenhuma policy. Rode npm run db:setup.");
    } else {
      for (const p of policies) console.log(`  ${p.tablename.padEnd(22)} ${p.policyname}`);
    }
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("✗ Erro:", err);
  process.exit(1);
});
