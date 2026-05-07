import { getBusinessSettings } from "@/lib/business-settings";

/**
 * Schema.org LocalBusiness + EventVenue JSON-LD for SEO.
 * Rendered on every public page via the (site) layout.
 */
export async function BusinessJsonLd() {
  const settings = await getBusinessSettings();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacocruzeiro.com.br";

  const sameAs = [
    settings.contact.instagram,
    settings.contact.facebook,
    settings.contact.tiktok,
    settings.contact.youtube,
  ].filter((u): u is string => !!u && u.length > 0);

  const json = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EventVenue"],
    "@id": `${siteUrl}#business`,
    name: settings.name,
    legalName: settings.legalName,
    url: siteUrl,
    telephone: `+${settings.contact.whatsappNumber}`,
    email: settings.contact.email,
    image: `${siteUrl}/opengraph-image`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address.street,
      addressLocality: settings.address.city,
      addressRegion: settings.address.state,
      postalCode: settings.address.zip,
      addressCountry: settings.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.address.lat,
      longitude: settings.address.lng,
    },
    sameAs,
    maximumAttendeeCapacity: settings.stats.maxCapacity,
    aggregateRating: settings.stats.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: settings.stats.rating,
          reviewCount: Math.max(1, settings.stats.eventsCompleted),
        }
      : undefined,
    areaServed: {
      "@type": "City",
      name: `${settings.address.city} e região`,
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
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD escaped via JSON.stringify
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
