import { Camera } from "lucide-react";

import { GalleryGrid } from "@/components/site/gallery-grid";
import { Container, Eyebrow, Section } from "@/components/ui/container";
import { getContentBlock } from "@/lib/content";
import { getGalleryPhotos } from "@/lib/gallery";

// Placeholders quando ainda não há fotos cadastradas. Sai assim que o
// admin sobe pelo menos 1 foto na galeria.
const GALLERY_SLOTS = [
  { tone: "from-primary to-primary/70", label: "Salão montado para casamento", ratio: "aspect-[4/3]" },
  { tone: "from-accent/50 to-primary/60", label: "Festa infantil", ratio: "aspect-square" },
  { tone: "from-secondary to-muted", label: "Iluminação cênica", ratio: "aspect-square" },
  { tone: "from-primary/80 to-accent/40", label: "Ambiente corporativo", ratio: "aspect-[4/3]" },
];

export async function TheSpace() {
  const [content, photos] = await Promise.all([
    getContentBlock("home.the_space"),
    getGalleryPhotos({ limit: 4 }),
  ]);

  return (
    <Section id="o-espaco">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {content.title}
            </h2>
            <div
              className="prose mt-6 text-base leading-7 text-muted-foreground"
              // HTML do Tiptap, sanitizado em setContentBlock
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {content.bullets.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
          </div>

          {photos.length >= 4 ? (
            <GalleryGrid photos={photos} layout="compact-4" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {GALLERY_SLOTS.map((slot, i) => (
                <div
                  key={i}
                  className={`group relative ${slot.ratio} overflow-hidden rounded-2xl bg-gradient-to-br ${slot.tone} ring-1 ring-black/5`}
                >
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="flex flex-col items-center gap-2 text-white/70">
                      <Camera className="size-6" aria-hidden />
                      <span className="text-xs uppercase tracking-widest">
                        {slot.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
