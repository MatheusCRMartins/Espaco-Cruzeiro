#!/usr/bin/env tsx
/**
 * Cria (ou promove) um usuário admin no Supabase Auth.
 *
 * Idempotente: se o user já existe, só promove.
 * Se ADMIN_PASSWORD não for fornecida, gera uma senha forte e mostra UMA vez.
 *
 * Uso:
 *   ADMIN_EMAIL=foo@bar.com npm run db:create-admin
 *   # ou explicitando a senha:
 *   ADMIN_EMAIL=foo@bar.com ADMIN_PASSWORD=minhaSenha npm run db:create-admin
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
let password = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !serviceRole) {
  console.error(
    "✗ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.",
  );
  process.exit(1);
}
if (!email) {
  console.error("✗ ADMIN_EMAIL é obrigatório (ex.: ADMIN_EMAIL=foo@bar.com npm run db:create-admin).");
  process.exit(1);
}

let generatedPassword = false;
if (!password) {
  // 18 chars base64-url-safe — ~108 bits de entropia
  password = crypto
    .randomBytes(18)
    .toString("base64")
    .replace(/[+/=]/g, "")
    .slice(0, 18);
  generatedPassword = true;
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(emailToFind: string) {
  // listUsers paginado — pra essa app a base é pequena, primeira página resolve
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === emailToFind.toLowerCase()) ?? null;
}

async function main() {
  console.log(`→ Procurando user com email "${email}"...`);
  const existing = await findUserByEmail(email!);

  if (existing) {
    const role =
      (existing.app_metadata?.role as string | undefined) ?? "(nenhum)";
    console.log(`  found: ${existing.id} (role atual: ${role})`);

    if (role === "admin") {
      console.log("✓ User já é admin. Nada a fazer.");
      return;
    }

    console.log("→ Promovendo para admin...");
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      app_metadata: { ...existing.app_metadata, role: "admin" },
    });
    if (error) throw error;
    console.log("✓ User promovido a admin.");
    console.log("  (senha existente preservada — use a que você já tinha)");
    return;
  }

  console.log("→ Criando novo user admin...");
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (error) throw error;

  console.log("\n✓ Admin criado com sucesso.\n");
  console.log("  ┌─────────────────────────────────────────────────");
  console.log(`  │  email:    ${email}`);
  console.log(`  │  password: ${password}`);
  console.log(`  │  user id:  ${data.user.id}`);
  console.log("  └─────────────────────────────────────────────────");
  if (generatedPassword) {
    console.log(
      "\n  ⚠️  COPIE A SENHA AGORA — gerada aleatoriamente, não volta a aparecer.",
    );
    console.log("  Guarde no Bitwarden / 1Password / gerenciador seguro.");
  }
}

main().catch((err) => {
  console.error("✗ Erro:", err);
  process.exit(1);
});
