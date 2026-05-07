import { BUSINESS } from "@/lib/constants";

/**
 * Schema.org LocalBusiness + EventVenue JSON-LD for SEO.
 * Rendered on every public page via the (site) layout.
 */
export function BusinessJsonLd() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacocruzeiro.com.br";
  const waNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? BUSINESS.contact.whatsappNumber;

  const json = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EventVenue"],
    "@id": `${siteUrl}#business`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: siteUrl,
    telephone: `+${waNumber}`,
    email: BUSINESS.contact.email,
    image: `${siteUrl}/opengraph-image`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.state,
      postalCode: BUSINESS.address.zip,
      addressCountry: BUSINESS.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.address.lat,
      longitude: BUSINESS.address.lng,
    },
    sameAs: [BUSINESS.contact.instagram],
    maximumAttendeeCapacity: BUSINESS.stats.maxCapacity,
    areaServed: {
      "@type": "City",
      name: "Osasco e região",
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Estacionamento" },
      { "@type": "LocationFeatureSpecification", name: "Buffet completo" },
      { "@type": "LocationFeatureSpecification", name: "Brinquedos infantis" },
      { "@type": "LocationFeatureSpecification", name: "Iluminação cênica" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is escaped via JSON.stringify
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
