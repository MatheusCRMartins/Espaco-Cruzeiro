"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { setContentBlock } from "@/lib/content";

export type SaveBlockState = {
  status: "idle" | "ok" | "error";
  message?: string;
};

export const SAVE_BLOCK_INITIAL: SaveBlockState = { status: "idle" };

/**
 * Server Action — salva um bloco de conteúdo do registry.
 * O JSON vem serializado em formData.get("payload"); a chave em formData.get("key").
 */
export async function saveContentBlockAction(
  _prev: SaveBlockState,
  formData: FormData,
): Promise<SaveBlockState> {
  const user = await requireAdmin();
  const key = String(formData.get("key") ?? "").trim();
  const raw = String(formData.get("payload") ?? "");

  if (!key) return { status: "error", message: "Chave obrigatória." };
  if (!raw) return { status: "error", message: "Payload vazio." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: "error", message: "JSON inválido." };
  }

  const result = await setContentBlock(key, parsed, user.id);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  await logAdminAction({
    userId: user.id,
    action: "save_content_block",
    entityType: "content_block",
    changes: { key },
  });
  revalidatePath("/admin/conteudo");
  revalidatePath("/", "layout");
  return { status: "ok", message: "Bloco salvo." };
}
