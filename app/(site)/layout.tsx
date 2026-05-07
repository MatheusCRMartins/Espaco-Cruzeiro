import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { BusinessJsonLd } from "@/components/site/json-ld";
import { getBusinessSettings } from "@/lib/business-settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getBusinessSettings();

  return (
    <>
      <BusinessJsonLd />
      <SiteHeader
        businessName={settings.name}
        whatsappNumber={settings.contact.whatsappNumber}
      />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <WhatsAppFloat whatsappNumber={settings.contact.whatsappNumber} />
    </>
  );
}
