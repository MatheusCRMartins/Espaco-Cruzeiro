import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  MERCADOPAGO_ACCESS_TOKEN: z.string().min(1).optional(),
  MERCADOPAGO_PUBLIC_KEY: z.string().min(1).optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  ADMIN_NOTIFICATION_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().min(10).optional(),
  CRON_SECRET: z.string().min(1).optional(),
});

const clientEnvSchema = serverEnvSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_SITE_URL: true,
  NEXT_PUBLIC_WHATSAPP_NUMBER: true,
});

type ServerEnv = z.infer<typeof serverEnvSchema>;
type ClientEnv = z.infer<typeof clientEnvSchema>;

let cachedServerEnv: ServerEnv | null = null;

/**
 * Normaliza strings vazias para undefined.
 * Em .env.local, `FOO=` cria FOO="" (string vazia), que falha em
 * `.optional()` + `.min(1)`. Tratamos como ausente, alinhado com a
 * semântica do Next.js (empty string = não configurado).
 */
function emptyStringsToUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = typeof v === "string" && v.trim() === "" ? undefined : v;
  }
  return out as T;
}

export function serverEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;
  const parsed = serverEnvSchema.safeParse(emptyStringsToUndefined(process.env));
  if (!parsed.success) {
    // Zod 4: `issues` é a fonte estável; flatten().fieldErrors fica vazio
    // quando o erro é em union / refine / preprocess.
    console.error("[env] invalid server environment:");
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "(root)";
      console.error(`  - ${path}: ${issue.message} [${issue.code}]`);
    }
    throw new Error("Invalid server environment. See logs for details.");
  }
  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export function clientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse(
    emptyStringsToUndefined({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    }),
  );
  if (!parsed.success) {
    throw new Error("Invalid client environment. Check NEXT_PUBLIC_* variables.");
  }
  return parsed.data;
}
