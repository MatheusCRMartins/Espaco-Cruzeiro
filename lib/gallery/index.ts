import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { getAssetPublicUrl } from "@/lib/storage";

export type GalleryPhoto = {
  id: string;
  url: string;
  alt: string;
  featured: boolean;
};

const TTL_MS = 60_000;
const cache = globalThis as unknown as {
  _ecGalleryCache?: Map<string, { value: GalleryPhoto[]; expiresAt: number }>;
};

function bucket(): Map<string, { value: GalleryPhoto[]; expiresAt: number }> {
  if (!cache._ecGalleryCache) cache._ecGalleryCache = new Map();
  return cache._ecGalleryCache;
}

export function invalidateGalleryCache() {
  cache._ecGalleryCache?.clear();
}

export async function getGalleryPhotos({
  featured,
  eventTypeId,
  limit,
}: {
  featured?: boolean;
  eventTypeId?: string;
  limit?: number;
} = {}): Promise<GalleryPhoto[]> {
  const cacheKey = `${featured ?? "any"}|${eventTypeId ?? "any"}|${limit ?? "all"}`;
  const now = Date.now();
  const map = bucket();
  const cached = map.get(cacheKey);
  if (cached && cached.expiresAt > now) return cached.value;

  try {
    const db = getDb();
    const conds = [] as ReturnType<typeof eq>[];
    if (featured !== undefined)
      conds.push(eq(schema.galleryPhotos.featured, featured));
    if (eventTypeId)
      conds.push(eq(schema.galleryPhotos.eventTypeId, eventTypeId));

    const q = db
      .select({
        id: schema.galleryPhotos.id,
        storagePath: schema.galleryPhotos.storagePath,
        altText: schema.galleryPhotos.altText,
        featured: schema.galleryPhotos.featured,
      })
      .from(schema.galleryPhotos)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(asc(schema.galleryPhotos.displayOrder));

    const rows = limit ? await q.limit(limit) : await q;

    const value: GalleryPhoto[] = rows.map((r) => ({
      id: r.id,
      url: getAssetPublicUrl(r.storagePath),
      alt: r.altText ?? "Foto da galeria",
      featured: r.featured,
    }));

    map.set(cacheKey, { value, expiresAt: now + TTL_MS });
    return value;
  } catch (err) {
    console.error("[gallery] failed to load:", err);
    return [];
  }
}
