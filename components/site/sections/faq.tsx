import { Container, Eyebrow, Section } from "@/components/ui/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/mock/faqs";

export function Faq() {
  return (
    <Section>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div>
            <Eyebrow>Dúvidas frequentes</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Tudo o que você precisa saber antes de reservar.
            </h2>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Se ficou alguma dúvida que não respondemos aqui, fale com a gente
              no WhatsApp — respondemos em minutos.
            </p>
          </div>

          <Accordion>
            {FAQS.map((f) => (
              <AccordionItem key={f.question}>
                <AccordionTrigger>{f.question}</AccordionTrigger>
                <AccordionContent>{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
}
