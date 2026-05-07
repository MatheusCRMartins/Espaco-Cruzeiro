import { asc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

import { RowDeleteButton } from "../disponibilidade/row-delete-button";
import { addGalleryPhoto, deleteGalleryPhoto } from "./actions";

export const metadata = { title: "Galeria" };
export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  let photos: Array<{
    id: string;
    storagePath: string;
    altText: string | null;
    displayOrder: number;
    featured: boolean;
  }> = [];
  let types: Array<{ id: string; name: string }> = [];

  try {
    const db = getDb();
    const [p, t] = await Promise.all([
      db
        .select({
          id: schema.galleryPhotos.id,
          storagePath: schema.galleryPhotos.storagePath,
          altText: schema.galleryPhotos.altText,
          displayOrder: schema.galleryPhotos.displayOrder,
          featured: schema.galleryPhotos.featured,
        })
        .from(schema.galleryPhotos)
        .orderBy(asc(schema.galleryPhotos.displayOrder)),
      db
        .select({ id: schema.eventTypes.id, name: schema.eventTypes.name })
        .from(schema.eventTypes)
        .orderBy(asc(schema.eventTypes.displayOrder)),
    ]);
    photos = p;
    types = t;
  } catch (err) {
    console.error("[admin/galeria] load failed:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Galeria</h1>
        <p className="text-sm text-muted-foreground">
          As fotos ficam no bucket Supabase Storage. Aqui cadastramos o caminho
          (path) que o frontend renderiza via URL assinada ou pública.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground sm:col-span-full">
            Nenhuma foto cadastrada.
          </p>
        )}
        {photos.map((p) => (
          <figure key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="aspect-[4/3] bg-muted" />
            <figcaption className="space-y-1 p-3 text-xs">
              <p className="truncate font-mono" title={p.storagePath}>
                {p.storagePath}
              </p>
              {p.altText && (
                <p className="text-muted-foreground">alt: {p.altText}</p>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-muted-foreground">
                  ordem {p.displayOrder} {p.featured && "· ⭐ destaque"}
                </span>
                <RowDeleteButton id={p.id} action={deleteGalleryPhoto} />
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-semibold">Adicionar foto</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Faça o upload no bucket <code className="rounded bg-muted px-1 py-0.5">gallery/</code>{" "}
          do Supabase Storage e cole o path aqui.
        </p>
        <form action={addGalleryPhoto} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="col-span-full flex flex-col gap-1 text-xs">
            <span className="font-medium">Path no bucket</span>
            <input
              name="storagePath"
              required
              placeholder="gallery/2026/casamento-ana-pedro.jpg"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm font-mono"
            />
          </label>
          <label className="col-span-full flex flex-col gap-1 text-xs">
            <span className="font-medium">Texto alternativo (SEO + acessibilidade)</span>
            <input
              name="altText"
              placeholder="Salão principal iluminado para a entrada dos noivos"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Tipo de evento (opcional)</span>
            <select
              name="eventTypeId"
              className="h-10 rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="">—</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Ordem</span>
            <input
              name="displayOrder"
              type="number"
              defaultValue={0}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
          </label>
          <label className="col-span-full inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" className="size-4" /> Marcar como
            destaque na home
          </label>
          <button className="col-span-full h-10 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Salvar
          </button>
        </form>
      </section>
    </div>
  );
}
