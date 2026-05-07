import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

export const ASSETS_BUCKET = "public-assets";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function ext(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos (combining marks)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Sobe um File pro bucket public-assets.
 * Path final: <prefix>/<timestamp>-<slug>.<ext>
 *
 * Retorna o path relativo (sem o bucket) — é o que vai no DB.
 */
export async function uploadAsset({
  file,
  prefix,
  baseName,
}: {
  file: File;
  prefix: "gallery" | "business" | "events";
  baseName?: string;
}): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  if (file.size === 0) {
    return { ok: false, error: "Arquivo vazio." };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: `Arquivo grande demais (máx. ${Math.floor(MAX_BYTES / 1024 / 1024)}MB).`,
    };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      error: "Tipo não permitido. Use JPG, PNG, WebP ou AVIF.",
    };
  }

  const stem = slugify(baseName ?? file.name.replace(/\.[^.]+$/, "")) || "foto";
  const path = `${prefix}/${Date.now()}-${stem}.${ext(file.type)}`;

  const supabase = createSupabaseAdminClient();
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      cacheControl: "31536000", // 1 ano — assets são imutáveis (path tem timestamp)
      upsert: false,
    });

  if (error) {
    console.error("[storage] upload failed:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, path };
}

/**
 * Remove um asset do bucket.
 * O path é o mesmo guardado no DB (relativo ao bucket).
 */
export async function deleteAsset(path: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(ASSETS_BUCKET).remove([path]);
  if (error) {
    console.error("[storage] delete failed:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Devolve a URL pública de um asset. Bucket é público — não requer signing.
 * Cache imutável (path tem timestamp).
 */
export function getAssetPublicUrl(path: string): string {
  const env = serverEnv();
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${ASSETS_BUCKET}/${path}`;
}

/**
 * Retorna o hostname do Supabase (pra colocar em next.config images.remotePatterns).
 */
export function getSupabaseStorageHostname(): string {
  const env = serverEnv();
  return new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname;
}
