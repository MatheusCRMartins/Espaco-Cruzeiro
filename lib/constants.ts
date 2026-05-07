/**
 * Central place for business constants. Values here are placeholders
 * until the client provides final data. See briefing Section 13.
 */
export const BUSINESS = {
  name: "Espaço Cruzeiro",
  legalName: "Espaço Cruzeiro Buffet e Eventos",
  // TODO: update when client provides CNPJ
  cnpj: "XX.XXX.XXX/0001-XX",
  address: {
    street: "Av. Cruzeiro do Sul, 1707A",
    neighborhood: "Rochdalle",
    city: "Osasco",
    state: "SP",
    zip: "06180-000",
    country: "BR",
    // Placeholder — replace with real coordinates before go-live
    lat: -23.5329,
    lng: -46.7918,
  },
  contact: {
    whatsappNumber: "5511999999999", // TODO: real number via NEXT_PUBLIC_WHATSAPP_NUMBER
    phone: "(11) 99999-9999",
    email: "contato@espacocruzeiro.com.br",
    instagram: "https://instagram.com/espacocruzeiro",
  },
  hours: [
    { label: "Segunda a sexta", value: "Sob agendamento" },
    { label: "Sábado e domingo", value: "Sob agendamento" },
  ],
  stats: {
    // TODO: confirm with client
    eventsCompleted: 500,
    maxCapacity: 150,
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/eventos/casamentos", label: "Eventos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;

export const LEGAL_LINKS = [
  { href: "/politica-de-privacidade", label: "Política de privacidade" },
  { href: "/termos-de-uso", label: "Termos de uso" },
  { href: "/politica-de-cancelamento", label: "Política de cancelamento" },
] as const;
