"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import {
  businessSettingsSchema,
  invalidateBusinessSettingsCache,
  updateBusinessSettings,
  type BusinessSettingsData,
} from "@/lib/business-settings";

export type SaveSettingsState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const SAVE_SETTINGS_INITIAL: SaveSettingsState = { status: "idle" };

/**
 * Server Action — salva business_settings.
 * Recebe FormData do <form action>, monta objeto, valida via Zod,
 * persiste e invalida cache.
 */
export async function saveBusinessSettings(
  _prev: SaveSettingsState,
  formData: FormData,
): Promise<SaveSettingsState> {
  const user = await requireAdmin();

  const numHours = Math.min(7, Math.max(0, Number(formData.get("hours.length") ?? 0)));
  const hours: Array<{ label: string; value: string }> = [];
  for (let i = 0; i < numHours; i++) {
    const label = String(formData.get(`hours.${i}.label`) ?? "").trim();
    const value = String(formData.get(`hours.${i}.value`) ?? "").trim();
    if (label && value) hours.push({ label, value });
  }

  const raw: Partial<BusinessSettingsData> = {
    name: String(formData.get("name") ?? "").trim(),
    legalName: String(formData.get("legalName") ?? "").trim(),
    cnpj: String(formData.get("cnpj") ?? "").trim(),
    address: {
      street: String(formData.get("address.street") ?? "").trim(),
      neighborhood: String(formData.get("address.neighborhood") ?? "").trim(),
      city: String(formData.get("address.city") ?? "").trim(),
      state: String(formData.get("address.state") ?? "").trim().toUpperCase(),
      zip: String(formData.get("address.zip") ?? "").trim(),
      country: String(formData.get("address.country") ?? "BR").trim().toUpperCase(),
      lat: Number(formData.get("address.lat") ?? 0),
      lng: Number(formData.get("address.lng") ?? 0),
    },
    contact: {
      whatsappNumber: String(formData.get("contact.whatsappNumber") ?? "").replace(/\D/g, ""),
      phone: String(formData.get("contact.phone") ?? "").trim(),
      email: String(formData.get("contact.email") ?? "").trim(),
      instagram: String(formData.get("contact.instagram") ?? "").trim(),
      facebook: String(formData.get("contact.facebook") ?? "").trim(),
      tiktok: String(formData.get("contact.tiktok") ?? "").trim(),
      youtube: String(formData.get("contact.youtube") ?? "").trim(),
    },
    hours,
    stats: {
      eventsCompleted: Number(formData.get("stats.eventsCompleted") ?? 0),
      maxCapacity: Number(formData.get("stats.maxCapacity") ?? 0),
      rating: Number(formData.get("stats.rating") ?? 5),
    },
    policy: {
      depositPercent: Number(formData.get("policy.depositPercent") ?? 30),
      softLockMinutes: Number(formData.get("policy.softLockMinutes") ?? 15),
    },
  };

  const parsed = businessSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors,
    };
  }

  try {
    await updateBusinessSettings(parsed.data, user.id);
    invalidateBusinessSettingsCache();
    await logAdminAction({
      userId: user.id,
      action: "save_business_settings",
      entityType: "business_settings",
    });
    revalidatePath("/", "layout");
    return { status: "ok", message: "Configurações salvas." };
  } catch (err) {
    console.error("[admin/configuracoes] save failed:", err);
    return {
      status: "error",
      message: "Não conseguimos salvar agora. Tente novamente.",
    };
  }
}
