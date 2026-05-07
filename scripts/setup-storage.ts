#!/usr/bin/env tsx
/**
 * Cria os buckets do Supabase Storage usados pelo site.
 * Idempotente: se já existem, só ajusta as configs.
 *
 *   npm run db:setup-storage
 *
 * Buckets criados:
 *   - public-assets (público)
 *      - prefixos: gallery/, business/, events/<id>/
 *      - leitura por qualquer um (URL pública)
 *      - escrita só via service_role (server-side)
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRole) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "public-assets";

async function main() {
  console.log(`→ Verificando bucket "${BUCKET}"…`);
  const { data: existing, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw listErr;

  const found = existing?.find((b) => b.name === BUCKET);
  if (!found) {
    console.log("  bucket não existe. Criando…");
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    });
    if (createErr) throw createErr;
    console.log("✓ Bucket criado.");
  } else {
    console.log(`  bucket já existe (id=${found.id}, public=${found.public}).`);
    if (!found.public) {
      console.log("  ⚠️  bucket NÃO é público. Atualizando…");
      const { error: updErr } = await supabase.storage.updateBucket(BUCKET, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
      });
      if (updErr) throw updErr;
      console.log("✓ Bucket marcado como público.");
    }
  }

  console.log("\n✓ Storage pronto.");
  console.log(
    `\nURL pública base: ${url}/storage/v1/object/public/${BUCKET}/<path>`,
  );
  console.log(
    "\nNo painel admin/galeria, agora tem upload nativo. As fotos vão pra:",
  );
  console.log(`  ${BUCKET}/gallery/<timestamp>-<slug>.<ext>`);
}

main().catch((err) => {
  console.error("✗ Erro:", err);
  process.exit(1);
});
