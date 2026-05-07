import "server-only";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/lib/db";

/**
 * Business settings — substitui o constants.ts hardcoded.
 * Schema Zod garante shape consistente; admin edita via /admin/configuracoes.
 *
 * Cache em memória do processo: invalidado em cada update via revalidateTag
 * (ou simplesmente expira por TTL — usamos TTL curto pra simplificar).
 */

export const businessSettingsSchema = z.object({
  // Identidade
  name: z.string().trim().min(1).max(120),
  legalName: z.string().trim().min(1).max(200),
  cnpj: z.string().trim().max(20),
  // Endereço
  address: z.object({
    street: z.string().trim().max(200),
    neighborhood: z.string().trim().max(120),
    city: z.string().trim().max(120),
    state: z.string().trim().length(2),
    zip: z.string().trim().max(15),
    country: z.string().trim().length(2).default("BR"),
    lat: z.number(),
    lng: z.number(),
  }),
  // Contato
  contact: z.object({
    whatsappNumber: z.string().trim().max(20), // só dígitos com DDI
    phone: z.string().trim().max(30),
    email: z.string().trim().toLowerCase().email(),
    instagram: z.string().trim().url().or(z.literal("")).optional(),
    facebook: z.string().trim().url().or(z.literal("")).optional(),
    tiktok: z.string().trim().url().or(z.literal("")).optional(),
    youtube: z.string().trim().url().or(z.literal("")).optional(),
  }),
  // Horários (label + valor livre — admin escreve à mão)
  hours: z
    .array(z.object({ label: z.string().min(1).max(60), value: z.string().min(1).max(120) }))
    .max(7),
  // Estatísticas exibidas no site
  stats: z.object({
    eventsCompleted: z.number().int().min(0),
    maxCapacity: z.number().int().min(1),
    rating: z.number().min(0).max(5).default(5),
  }),
  // Política do funil de reservas
  policy: z.object({
    depositPercent: z.number().int().min(0).max(100).default(30),
    softLockMinutes: z.number().int().min(1).max(180).default(15),
  }),
});

export type BusinessSettingsData = z.infer<typeof businessSettingsSchema>;

/**
 * Defaults — usados quando o banco ainda não tem registro (primeiro deploy).
 * Substitui o BUSINESS de lib/constants.ts.
 */
export const DEFAULT_BUSINESS_SETTINGS: BusinessSettingsData = {
  name: "Espaço Cruzeiro",
  legalName: "Espaço Cruzeiro Buffet e Eventos",
  cnpj: "XX.XXX.XXX/0001-XX",
  address: {
    street: "Av. Cruzeiro do Sul, 1707A",
    neighborhood: "Rochdalle",
    city: "Osasco",
    state: "SP",
    zip: "06180-000",
    country: "BR",
    lat: -23.5329,
    lng: -46.7918,
  },
  contact: {
    whatsappNumber: "5511999999999",
    phone: "(11) 99999-9999",
    email: "contato@espacocruzeiro.com.br",
    instagram: "https://instagram.com/espacocruzeiro",
    facebook: "",
    tiktok: "",
    youtube: "",
  },
  hours: [
    { label: "Segunda a sexta", value: "Sob agendamento" },
    { label: "Sábado e domingo", value: "Sob agendamento" },
  ],
  stats: { eventsCompleted: 500, maxCapacity: 150, rating: 5 },
  policy: { depositPercent: 30, softLockMinutes: 15 },
};

const CACHE_TTL_MS = 30_000; // 30s — admin vê mudança quase imediatamente
const globalCache = globalThis as unknown as {
  _ecBizSettings?: { data: BusinessSettingsData; expiresAt: number };
};

/**
 * Lê settings do banco. Se não existe, devolve defaults (sem inserir).
 * Cache curto pra não esmagar o pooler.
 */
export async function getBusinessSettings(): Promise<BusinessSettingsData> {
  const now = Date.now();
  const cached = globalCache._ecBizSettings;
  if (cached && cached.expiresAt > now) return cached.data;

  try {
    const db = getDb();
    const [row] = await db
      .select({ data: schema.businessSettings.data })
      .from(schema.businessSettings)
      .where(eq(schema.businessSettings.key, "default"))
      .limit(1);

    const parsed = row
      ? businessSettingsSchema.safeParse(row.data)
      : { success: true as const, data: DEFAULT_BUSINESS_SETTINGS };

    const data = parsed.success ? parsed.data : DEFAULT_BUSINESS_SETTINGS;
    globalCache._ecBizSettings = { data, expiresAt: now + CACHE_TTL_MS };
    return data;
  } catch (err) {
    console.error("[business-settings] fallback to defaults:", err);
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

export function invalidateBusinessSettingsCache() {
  globalCache._ecBizSettings = undefined;
}

export async function updateBusinessSettings(
  partial: Partial<BusinessSettingsData>,
  updatedBy: string,
): Promise<BusinessSettingsData> {
  const current = await getBusinessSettings();
  const merged = deepMerge(current, partial);
  const parsed = businessSettingsSchema.parse(merged);

  const db = getDb();
  // Atomic upsert via ON CONFLICT — evita race com SELECT+INSERT.
  await db
    .insert(schema.businessSettings)
    .values({ key: "default", data: parsed, updatedBy })
    .onConflictDoUpdate({
      target: schema.businessSettings.key,
      set: { data: parsed, updatedBy, updatedAt: new Date() },
    });

  invalidateBusinessSettingsCache();
  return parsed;
}

function deepMerge<T>(target: T, source: Partial<T>): T {
  const out: Record<string, unknown> = { ...(target as Record<string, unknown>) };
  for (const [k, v] of Object.entries(source as Record<string, unknown>)) {
    if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object") {
      out[k] = deepMerge(out[k], v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}
