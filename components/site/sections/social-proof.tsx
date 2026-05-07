import { Star, Users, Calendar, Heart } from "lucide-react";

import { Container } from "@/components/ui/container";
import { getBusinessSettings } from "@/lib/business-settings";

export async function SocialProof() {
  const settings = await getBusinessSettings();
  const stats = [
    {
      icon: Calendar,
      value: `+${settings.stats.eventsCompleted}`,
      label: "eventos realizados",
    },
    {
      icon: Users,
      value: `até ${settings.stats.maxCapacity}`,
      label: "convidados acomodados",
    },
    {
      icon: Star,
      value: settings.stats.rating.toFixed(1),
      label: "avaliação média",
    },
    {
      icon: Heart,
      value: "98%",
      label: "recomendariam para amigos",
    },
  ];

  return (
    <section className="border-b border-border bg-muted/30 py-10">
      <Container>
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
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
