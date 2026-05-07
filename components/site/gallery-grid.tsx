"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type GalleryPhotoData = {
  id: string;
  url: string;
  alt: string;
};

/**
 * Grid de fotos com lightbox. Server component pai busca as URLs
 * (via lib/gallery) e passa pra cá; o lightbox faz preload da
 * próxima foto pra navegação fluida.
 *
 * A11y:
 *  - aria-modal no overlay
 *  - ESC fecha; ← → navegam
 *  - foco move pro botão fechar ao abrir
 */
export function GalleryGrid({
  photos,
  layout = "default",
}: {
  photos: GalleryPhotoData[];
  layout?: "default" | "compact-4";
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight")
        setActiveIndex((i) => (i === null ? null : Math.min(photos.length - 1, i + 1)));
      if (e.key === "ArrowLeft")
        setActiveIndex((i) => (i === null ? null : Math.max(0, i - 1)));
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeIndex, photos.length]);

  if (!photos.length) return null;

  const showcaseClass =
    layout === "compact-4"
      ? "grid grid-cols-2 gap-3 sm:gap-4"
      : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4";

  // Em compact-4 só mostra as primeiras 4 com aspectos diferentes pra parecer
  // moodboard
  const visible = layout === "compact-4" ? photos.slice(0, 4) : photos;

  const aspectMap: Record<number, string> = {
    0: "aspect-[4/3]",
    1: "aspect-square",
    2: "aspect-square",
    3: "aspect-[4/3]",
  };

  const active = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <>
      <div className={showcaseClass}>
        {visible.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={`Ver foto: ${p.alt}`}
            className={cn(
              "group relative overflow-hidden rounded-2xl ring-1 ring-black/5 transition hover:opacity-95",
              layout === "compact-4"
                ? aspectMap[i] ?? "aspect-square"
                : "aspect-[4/3]",
            )}
          >
            <Image
              src={p.url}
              alt={p.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active !== null && activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galeria"
          className="fixed inset-0 z-50 grid grid-rows-[auto_1fr_auto] bg-black/95 backdrop-blur-sm"
        >
          <header className="flex items-center justify-between p-4 text-white/80">
            <span className="text-sm">
              {activeIndex + 1} de {photos.length}
            </span>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Fechar"
              className="rounded p-2 hover:bg-white/10"
              autoFocus
            >
              <X className="size-5" />
            </button>
          </header>

          <div className="relative flex items-center justify-center px-4 sm:px-12">
            {activeIndex > 0 && (
              <button
                type="button"
                onClick={() => setActiveIndex(activeIndex - 1)}
                aria-label="Foto anterior"
                className="absolute left-2 sm:left-6 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            <div className="relative h-full max-h-[80vh] w-full max-w-5xl">
              <Image
                src={active.url}
                alt={active.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {activeIndex < photos.length - 1 && (
              <button
                type="button"
                onClick={() => setActiveIndex(activeIndex + 1)}
                aria-label="Próxima foto"
                className="absolute right-2 sm:right-6 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="size-6" />
              </button>
            )}
          </div>

          <footer className="p-4 text-center text-sm text-white/70">
            {active.alt}
          </footer>
        </div>
      )}
    </>
  );
}
