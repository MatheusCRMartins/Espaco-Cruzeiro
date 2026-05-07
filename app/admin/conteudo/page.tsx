import { eq, inArray } from "drizzle-orm";

import { CONTENT_REGISTRY } from "@/lib/content";
import { getDb, schema } from "@/lib/db";

import {
  ContentBlockEditor,
  type EntryDescriptor,
  type FieldDef,
} from "./content-block-editor";

export const metadata = { title: "Conteúdo" };
export const dynamic = "force-dynamic";

export default async function ContentAdminPage() {
  const keys = CONTENT_REGISTRY.map((e) => e.key);

  let savedByKey = new Map<string, unknown>();
  try {
    const db = getDb();
    const rows = await db
      .select({
        key: schema.contentBlocks.key,
        value: schema.contentBlocks.value,
      })
      .from(schema.contentBlocks)
      .where(inArray(schema.contentBlocks.key, keys));
    savedByKey = new Map(rows.map((r) => [r.key, r.value]));
  } catch (err) {
    console.error("[admin/conteudo] load failed:", err);
  }
  // suppress unused
  void eq;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Conteúdo editável</h1>
        <p className="text-sm text-muted-foreground">
          Textos do site público — hero da home, descrição do espaço, FAQ, CTA
          final. Mudanças refletem no site em até 30 segundos.
        </p>
      </div>

      <div className="space-y-3">
        {CONTENT_REGISTRY.map((entry) => {
          const descriptor: EntryDescriptor = {
            key: entry.key,
            title: entry.title,
            description: entry.description,
            fields: entry.fields.map((f) => ({
              path: f.path,
              field: f.field as FieldDef,
            })),
          };
          const initial = savedByKey.get(entry.key) ?? entry.default;
          return (
            <ContentBlockEditor
              key={entry.key}
              entry={descriptor}
              initialValue={initial}
            />
          );
        })}
      </div>
    </div>
  );
}
