import Image from "next/image";
import { asc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { getAssetPublicUrl } from "@/lib/storage";

import { PhotoRowActions } from "./photo-row-actions";
import { UploadForm } from "./upload-form";

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
          Fotos do espaço e dos eventos. Faça upload direto pelo painel —
          a foto é otimizada e servida via Supabase Storage com CDN.
        </p>
      </div>

      <UploadForm eventTypes={types} />

      <section>
        <h2 className="mb-3 font-semibold">
          Fotos cadastradas{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({photos.length})
          </span>
        </h2>

        {photos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma foto ainda. Faça o primeiro upload acima.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <figure
                key={p.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={getAssetPublicUrl(p.storagePath)}
                    alt={p.altText ?? "Foto da galeria"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {p.featured && (
                    <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 shadow">
                      ⭐ Destaque
                    </span>
                  )}
                </div>
                <figcaption className="space-y-2 p-3 text-xs">
                  <p className="text-muted-foreground line-clamp-2">
                    {p.altText ?? <em>(sem texto alternativo)</em>}
                  </p>
                  <PhotoRowActions id={p.id} initialFeatured={p.featured} />
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
