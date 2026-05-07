import { Star, Users, Calendar, Heart } from "lucide-react";

import { Container } from "@/components/ui/container";
import { BUSINESS } from "@/lib/constants";

const STATS = [
  {
    icon: Calendar,
    value: `+${BUSINESS.stats.eventsCompleted}`,
    label: "eventos realizados",
  },
  {
    icon: Users,
    value: `até ${BUSINESS.stats.maxCapacity}`,
    label: "convidados acomodados",
  },
  {
    icon: Star,
    value: "5.0",
    label: "avaliação média",
  },
  {
    icon: Heart,
    value: "98%",
    label: "recomendariam para amigos",
  },
];

export function SocialProof() {
  return (
    <section className="border-b border-border bg-muted/30 py-10">
      <Container>
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <dt className="font-display text-xl font-semibold">{value}</dt>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
