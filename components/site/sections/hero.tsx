import Link from "next/link";
import { Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";
import { getBusinessSettings } from "@/lib/business-settings";
import { getContentBlock } from "@/lib/content";
import { cn, waLink } from "@/lib/utils";

export async function Hero() {
  const [settings, content] = await Promise.all([
    getBusinessSettings(),
    getContentBlock("home.hero"),
  ]);
  const waNumber = settings.contact.whatsappNumber;
  const eyebrow =
    content.eyebrow ||
    `Buffet em ${settings.address.city} · ${settings.address.street.split(",")[0]}`;

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.accent/25),transparent_55%),radial-gradient(ellipse_at_bottom_left,theme(colors.primary/15),transparent_50%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'40\\'><circle cx=\\'1\\' cy=\\'1\\' r=\\'1\\' fill=\\'%23c9a961\\' opacity=\\'0.08\\'/></svg>')]"
      />
      <Container className="relative py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            {content.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {content.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/reservar"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              <Sparkles className="size-4" aria-hidden />
              Verificar disponibilidade
            </Link>
            <a
              href={waLink(
                waNumber,
                `Olá! Vi o site e gostaria de tirar uma dúvida sobre o ${settings.name}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Falar no WhatsApp
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Pagamento seguro por Mercado Pago · PIX, cartão ou boleto
          </p>
        </div>
      </Container>
    </section>
  );
}
