#!/usr/bin/env tsx
/**
 * Smoke test do RLS — usa anon key (cliente normal) e tenta SELECTs.
 * Confirma que policies estão protegendo o que deveriam.
 *
 *   npm run db:test-rls
 *
 * Saída esperada (banco em estado limpo):
 *   ✓ event_types (active=true)         readable
 *   ✓ event_types (active=false)        blocked      (ou 0 rows)
 *   ✓ availability_rules                readable
 *   ✓ blocked_dates                     readable
 *   ✓ testimonials (approved=true)      readable
 *   ✓ testimonials (approved=false)     blocked      (ou 0 rows)
 *   ✓ gallery_photos                    readable
 *   ✓ content_blocks                    readable
 *   ✓ business_settings                 readable
 *   ✓ bookings                          BLOCKED      (PII)
 *   ✓ leads                             BLOCKED      (PII)
 *   ✓ notifications_log                 BLOCKED
 *   ✓ admin_audit_log                   BLOCKED
 *
 * Falha se algo "deveria estar bloqueado" e retorna rows, OU se algo
 * "deveria ser legível" e bloqueia.
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios.");
  process.exit(1);
}

const anon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Expectation = "readable" | "blocked";

type ProbeResult = {
  data: unknown[] | null;
  error: { message: string; code?: string } | null;
};

async function probe(
  label: string,
  expectation: Expectation,
  run: () => PromiseLike<ProbeResult>,
) {
  const { data, error } = await run();
  const rows = Array.isArray(data) ? data.length : 0;

  if (expectation === "readable") {
    if (error) {
      console.error(`✗ ${label.padEnd(40)} FAIL — esperado readable, mas erro: ${error.message}`);
      failures++;
      return;
    }
    console.log(`✓ ${label.padEnd(40)} readable (${rows} rows)`);
  } else {
    // Em RLS, a falta de policy NÃO retorna erro — retorna 0 rows.
    // O comportamento ideal é 0 rows (silently filtered).
    if (rows > 0) {
      console.error(`✗ ${label.padEnd(40)} FAIL — esperado blocked, mas leu ${rows} rows!`);
      failures++;
      return;
    }
    if (error) {
      // alguns drivers retornam erro de permissão — também aceitável
      console.log(`✓ ${label.padEnd(40)} BLOCKED (erro: ${error.code ?? error.message})`);
    } else {
      console.log(`✓ ${label.padEnd(40)} BLOCKED (0 rows visíveis)`);
    }
  }
}

let failures = 0;

async function main() {
  console.log("→ Testando RLS com anon key (simula request público).\n");

  await probe("event_types (active=true)", "readable", () =>
    anon.from("event_types").select("id").eq("active", true).then(({ data, error }) => ({ data, error })),
  );
  await probe("event_types (active=false)", "blocked", () =>
    anon.from("event_types").select("id").eq("active", false).then(({ data, error }) => ({ data, error })),
  );

  await probe("availability_rules", "readable", () =>
    anon.from("availability_rules").select("id").eq("active", true).then(({ data, error }) => ({ data, error })),
  );
  await probe("blocked_dates", "readable", () =>
    anon.from("blocked_dates").select("id").then(({ data, error }) => ({ data, error })),
  );

  await probe("testimonials (approved=true)", "readable", () =>
    anon.from("testimonials").select("id").eq("approved", true).then(({ data, error }) => ({ data, error })),
  );
  await probe("testimonials (approved=false)", "blocked", () =>
    anon.from("testimonials").select("id").eq("approved", false).then(({ data, error }) => ({ data, error })),
  );

  await probe("gallery_photos", "readable", () =>
    anon.from("gallery_photos").select("id").then(({ data, error }) => ({ data, error })),
  );
  await probe("content_blocks", "readable", () =>
    anon.from("content_blocks").select("id").then(({ data, error }) => ({ data, error })),
  );
  await probe("business_settings", "readable", () =>
    anon.from("business_settings").select("id").then(({ data, error }) => ({ data, error })),
  );

  // PII / sensíveis — devem estar bloqueadas
  await probe("bookings (PII)", "blocked", () =>
    anon.from("bookings").select("id").then(({ data, error }) => ({ data, error })),
  );
  await probe("leads (PII)", "blocked", () =>
    anon.from("leads").select("id").then(({ data, error }) => ({ data, error })),
  );
  await probe("notifications_log", "blocked", () =>
    anon.from("notifications_log").select("id").then(({ data, error }) => ({ data, error })),
  );
  await probe("admin_audit_log", "blocked", () =>
    anon.from("admin_audit_log").select("id").then(({ data, error }) => ({ data, error })),
  );

  console.log();
  if (failures > 0) {
    console.error(`✗ ${failures} verificação(ões) falharam. Rode 'npm run db:setup' pra reaplicar policies.`);
    process.exit(1);
  }
  console.log("✓ Tudo conforme esperado. RLS está protegendo o que deveria.");
}

main().catch((err) => {
  console.error("✗ Erro:", err);
  process.exit(1);
});
