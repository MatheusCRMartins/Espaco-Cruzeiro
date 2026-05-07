import type { ReactNode } from "react";

import { Container, Eyebrow, Section } from "@/components/ui/container";

/**
 * Casca reutilizada pelas páginas legais.
 * Sem `@tailwindcss/typography` — formatação aplicada via classes utilitárias
 * em cada tag dentro do `children` (ver pages).
 */
export function LegalPage({
  eyebrow,
  title,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <Section>
      <Container>
        <article className="mx-auto max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
            Atualizado em {lastUpdated}
          </p>

          <div className="mt-10 space-y-8 text-base leading-7 text-foreground/90 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mt-2 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6 [&_a]:text-accent [&_a]:underline-offset-2 hover:[&_a]:underline [&_strong]:font-medium [&_strong]:text-foreground">
            {children}
          </div>
        </article>
      </Container>
    </Section>
  );
}
