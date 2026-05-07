import "server-only";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/lib/db";
import { sanitizeRichText } from "./sanitize";

export { sanitizeRichText };

/**
 * Editable content — content_blocks.
 *
 * Cada chave tem um schema Zod + um valor padrão. O site público
 * usa getContentBlock(key) que lê do banco; se não existe ou o JSON
 * salvo não bate com o schema, devolve o default.
 *
 * Pra adicionar uma nova chave editável:
 * 1. Adicione um entry em CONTENT_REGISTRY abaixo
 * 2. Renderize no /admin/conteudo (já lê automaticamente do registry)
 * 3. Consuma com getContentBlock("nome.chave") no componente do site
 */

// FAQ — lista de Q&A. Resposta é HTML sanitizado (Tiptap output).
export const faqItemsSchema = z
  .array(
    z.object({
      question: z.string().trim().min(3).max(200),
      answer: z.string().trim().min(3).max(5000),
    }),
  )
  .max(20);

export type FaqItems = z.infer<typeof faqItemsSchema>;

// Hero — títulos editáveis
export const heroSchema = z.object({
  eyebrow: z.string().trim().max(80),
  title: z.string().trim().min(3).max(200),
  subtitle: z.string().trim().max(500),
});

export type HeroContent = z.infer<typeof heroSchema>;

// FinalCta — bloco de conversão no fim da home
export const finalCtaSchema = z.object({
  title: z.string().trim().min(3).max(200),
  subtitle: z.string().trim().max(500),
});

export type FinalCtaContent = z.infer<typeof finalCtaSchema>;

// Bloco "O espaço" — texto + lista de bullets
export const theSpaceSchema = z.object({
  eyebrow: z.string().trim().max(60),
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().min(3).max(2000),
  bullets: z.array(z.string().trim().min(1).max(200)).max(10),
});

export type TheSpaceContent = z.infer<typeof theSpaceSchema>;

// Registro central — usado pela admin page pra renderizar editores
type ContentField =
  | { kind: "text"; label: string; placeholder?: string }
  | { kind: "textarea"; label: string; placeholder?: string; rows?: number }
  | { kind: "richtext"; label: string; placeholder?: string }
  | { kind: "list-strings"; label: string; itemLabel: string }
  | {
      kind: "list-faq";
      label: string;
    };

type ContentRegistryEntry<T> = {
  key: string;
  title: string;
  description: string;
  // Campos do form (admin) — em ordem
  fields: Array<{ path: string; field: ContentField }>;
  schema: z.ZodType<T>;
  default: T;
};

export const CONTENT_REGISTRY = [
  {
    key: "home.hero",
    title: "Home — Hero",
    description: "Bloco de abertura da home com eyebrow, título principal e subtítulo.",
    fields: [
      { path: "eyebrow", field: { kind: "text", label: "Eyebrow (etiqueta de cima)" } as ContentField },
      { path: "title", field: { kind: "text", label: "Título principal" } as ContentField },
      { path: "subtitle", field: { kind: "textarea", label: "Subtítulo", rows: 3 } as ContentField },
    ],
    schema: heroSchema,
    default: {
      eyebrow: "",
      title: "O lugar certo para os momentos que você não esquece.",
      subtitle:
        "Aniversários, casamentos, chá de bebê, revelação e eventos corporativos. Verifique se sua data está livre e garanta com um sinal online.",
    } satisfies HeroContent,
  } as ContentRegistryEntry<HeroContent>,
  {
    key: "home.the_space",
    title: 'Home — Bloco "O espaço"',
    description: "Apresentação do espaço com lista de bullets dos diferenciais.",
    fields: [
      { path: "eyebrow", field: { kind: "text", label: "Eyebrow" } as ContentField },
      { path: "title", field: { kind: "text", label: "Título" } as ContentField },
      { path: "body", field: { kind: "richtext", label: "Descrição" } as ContentField },
      {
        path: "bullets",
        field: { kind: "list-strings", label: "Diferenciais", itemLabel: "diferencial" } as ContentField,
      },
    ],
    schema: theSpaceSchema,
    default: {
      eyebrow: "O espaço",
      title: "Um lugar feito para o que importa.",
      body: "<p>Mais de 400m² que se transformam conforme o seu evento — do clima íntimo de uma cerimônia à pista cheia de uma celebração. Iluminação cênica, sonorização, brinquedos infantis e estacionamento próprio.</p>",
      bullets: [
        "Buffet completo com cozinha própria",
        "Ar condicionado em todo o salão",
        "Estacionamento gratuito para convidados",
        "15 min da Marginal Tietê, com fácil acesso",
      ],
    } satisfies TheSpaceContent,
  } as ContentRegistryEntry<TheSpaceContent>,
  {
    key: "home.final_cta",
    title: "Home — CTA final",
    description: "Bloco de chamada final pra reservar antes do footer.",
    fields: [
      { path: "title", field: { kind: "text", label: "Título" } as ContentField },
      { path: "subtitle", field: { kind: "textarea", label: "Subtítulo", rows: 2 } as ContentField },
    ],
    schema: finalCtaSchema,
    default: {
      title: "Sua data ainda está livre?",
      subtitle:
        "Verifique agora e reserve com um sinal pequeno. Nada de esperar retorno — você sai daqui com a data garantida.",
    } satisfies FinalCtaContent,
  } as ContentRegistryEntry<FinalCtaContent>,
  {
    key: "faq.items",
    title: "FAQ — Perguntas frequentes",
    description: "Aparece na home e na página de cada tipo de evento. Use bem porque resolve muita dúvida que vira lead frio.",
    fields: [{ path: "", field: { kind: "list-faq", label: "Perguntas" } as ContentField }],
    schema: faqItemsSchema,
    default: [
      {
        question: "Como funciona o pagamento da reserva?",
        answer:
          "<p>Você pode garantir a data pagando um sinal de 30% do valor total, online (PIX, cartão ou boleto). O restante é combinado diretamente com a nossa equipe.</p>",
      },
      {
        question: "Qual é a capacidade máxima do espaço?",
        answer:
          "<p>O espaço comporta até 150 pessoas confortavelmente, com layout flexível para cerimônia, jantar servido ou formato solto com mesas e pista de dança.</p>",
      },
      {
        question: "A comida e as bebidas estão inclusas?",
        answer:
          "<p>Sim. Oferecemos pacotes com buffet completo (entradas, principais, sobremesas) e opções de bebidas. O cardápio é ajustado com você antes do evento.</p>",
      },
      {
        question: "Posso levar meu próprio decorador, fotógrafo ou DJ?",
        answer:
          "<p>Pode sim. Temos parceiros de confiança que costumamos indicar, mas você tem total liberdade para trazer os fornecedores que preferir.</p>",
      },
    ] satisfies FaqItems,
  } as ContentRegistryEntry<FaqItems>,
] as const;

export type ContentKey = (typeof CONTENT_REGISTRY)[number]["key"];

/**
 * Map chave → tipo. Mantido em sync manual com CONTENT_REGISTRY pra
 * inferência tipada em getContentBlock(key) sem conditional type frágil.
 */
export type ContentTypes = {
  "home.hero": HeroContent;
  "home.the_space": TheSpaceContent;
  "home.final_cta": FinalCtaContent;
  "faq.items": FaqItems;
};

const TTL_MS = 30_000;
type CacheEntry = { value: unknown; expiresAt: number };
const globalCache = globalThis as unknown as {
  _ecContentCache?: Map<string, CacheEntry>;
};
function cache(): Map<string, CacheEntry> {
  if (!globalCache._ecContentCache) globalCache._ecContentCache = new Map();
  return globalCache._ecContentCache;
}

export function invalidateContentCache(key?: string) {
  if (key) cache().delete(key);
  else cache().clear();
}

/**
 * Lê um bloco de conteúdo. Se não existe ou o JSON está corrompido,
 * devolve o default do registry.
 */
export async function getContentBlock<K extends keyof ContentTypes>(
  key: K,
): Promise<ContentTypes[K]> {
  const entry = CONTENT_REGISTRY.find((e) => e.key === key);
  if (!entry) throw new Error(`unknown content key: ${key}`);

  const now = Date.now();
  const cached = cache().get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value as ContentTypes[K];
  }

  let value: unknown = entry.default;
  try {
    const db = getDb();
    const [row] = await db
      .select({ value: schema.contentBlocks.value })
      .from(schema.contentBlocks)
      .where(eq(schema.contentBlocks.key, key))
      .limit(1);
    if (row) {
      const parsed = entry.schema.safeParse(row.value);
      if (parsed.success) value = parsed.data;
    }
  } catch (err) {
    console.error(`[content] fallback to default for "${key}":`, err);
  }

  cache().set(key, { value, expiresAt: now + TTL_MS });
  return value as ContentTypes[K];
}

/**
 * Aplica sanitizeRichText nos paths que o registry marcou como `richtext`,
 * mais o `answer` de cada item em `list-faq`. Roda antes do safeParse pra
 * garantir que nada de HTML escapa do allowlist.
 */
function sanitizeBeforeSave(entry: typeof CONTENT_REGISTRY[number], value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;

  // FAQ é um Array de items; sanitiza answer de cada
  for (const f of entry.fields) {
    if (f.field.kind === "list-faq" && Array.isArray(value)) {
      return value.map((item: unknown) => {
        if (item && typeof item === "object" && "answer" in item) {
          const it = item as { question: string; answer: string };
          return { ...it, answer: sanitizeRichText(String(it.answer ?? "")) };
        }
        return item;
      });
    }
    if (f.field.kind === "richtext" && f.path) {
      // assume path simples (sem dots aninhados profundos)
      const obj = value as Record<string, unknown>;
      const v = obj[f.path];
      if (typeof v === "string") {
        obj[f.path] = sanitizeRichText(v);
      }
    }
  }
  return value;
}

export async function setContentBlock(
  key: string,
  value: unknown,
  updatedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const entry = CONTENT_REGISTRY.find((e) => e.key === key);
  if (!entry) return { ok: false, error: `Chave desconhecida: ${key}` };

  const sanitized = sanitizeBeforeSave(entry, value);
  const parsed = entry.schema.safeParse(sanitized);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`)
        .join("; "),
    };
  }

  const db = getDb();
  // Atomic upsert — evita race com SELECT+INSERT que daria UniqueViolation
  // em saves simultâneos do mesmo bloco.
  await db
    .insert(schema.contentBlocks)
    .values({
      key,
      value: parsed.data as object,
      updatedBy,
    })
    .onConflictDoUpdate({
      target: schema.contentBlocks.key,
      set: {
        value: parsed.data as object,
        updatedBy,
        updatedAt: new Date(),
      },
    });

  invalidateContentCache(key);
  return { ok: true };
}
