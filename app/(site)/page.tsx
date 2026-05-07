import { Hero } from "@/components/site/sections/hero";
import { SocialProof } from "@/components/site/sections/social-proof";
import { TheSpace } from "@/components/site/sections/the-space";
import { EventTypesGrid } from "@/components/site/sections/event-types-grid";
import { HowItWorks } from "@/components/site/sections/how-it-works";
import { BudgetCalculator } from "@/components/site/sections/budget-calculator";
import { Testimonials } from "@/components/site/sections/testimonials";
import { Faq } from "@/components/site/sections/faq";
import { FinalCta } from "@/components/site/sections/final-cta";
import { getBusinessSettings } from "@/lib/business-settings";

export default async function HomePage() {
  const settings = await getBusinessSettings();

  return (
    <>
      <Hero />
      <SocialProof />
      <TheSpace />
      <EventTypesGrid />
      <HowItWorks />
      <BudgetCalculator whatsappNumber={settings.contact.whatsappNumber} />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
