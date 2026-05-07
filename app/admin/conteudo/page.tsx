import { asc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

import { saveContentBlock } from "./actions";

export const metadata = { title: "Conteúdo" };
export const dynamic = "force-dynamic";

const SUGGESTED_KEYS = [
  "home.hero.title",
  "home.hero.subtitle",
  "home.stats",
  "sobre.intro",
  "faq.items",
];

export default async function ContentAdminPage() {
  let blocks: Array<{ id: string; key: string; value: unknown; updatedAt: Date }> = [];

  try {
    const db = getDb();
    blocks = await db
      .select({
        id: schema.contentBlocks.id,
        key: schema.contentBlocks.key,
        value: schema.contentBlocks.value,
        updatedAt: schema.contentBlocks.updatedAt,
      })
      .from(schema.contentBlocks)
      .orderBy(asc(schema.contentBlocks.key));
  } catch (err) {
    console.error("[admin/conteudo] load failed:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Conteúdo editável</h1>
        <p className="text-sm text-muted-foreground">
          Blocos de texto/JSON editáveis por chave. O frontend consome via
          <code className="mx-1 rounded bg-muted px-1 py-0.5">content_blocks</code>.
        </p>
      </div>

      <div className="grid gap-3">
        {blocks.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Nenhum bloco cadastrado. Sugestão de chaves iniciais:{" "}
            {SUGGESTED_KEYS.join(", ")}.
          </p>
        )}
        {blocks.map((b) => (
          <details key={b.id} className="group rounded-lg border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm font-medium">
              <code className="font-mono">{b.key}</code>
              <span className="ml-3 text-xs text-muted-foreground">
                atualizado em {b.updatedAt.toLocaleString("pt-BR")}
              </span>
            </summary>
            <form action={saveContentBlock} className="mt-4 space-y-2">
              <input type="hidden" name="key" value={b.key} />
              <textarea
                name="value"
                rows={8}
                defaultValue={JSON.stringify(b.value, null, 2)}
                className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs"
                spellCheck={false}
              />
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Salvar
              </button>
            </form>
          </details>
        ))}
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-semibold">Novo bloco</h2>
        <form action={saveContentBlock} className="mt-4 space-y-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Chave</span>
            <input
              name="key"
              required
              placeholder="home.hero.title"
              list="suggested-keys"
              className="h-10 rounded-md border border-border bg-background px-3 font-mono text-sm"
            />
            <datalist id="suggested-keys">
              {SUGGESTED_KEYS.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Valor (JSON)</span>
            <textarea
              name="value"
              rows={6}
              placeholder='"Eventos que você vai querer lembrar pra sempre."'
              className="rounded-md border border-border bg-background p-3 font-mono text-xs"
              spellCheck={false}
              required
            />
          </label>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Criar
          </button>
        </form>
      </section>
    </div>
  );
}
