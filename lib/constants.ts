/**
 * Constantes ESTÁTICAS — não dependem do cliente / não mudam por deploy.
 *
 * Para dados do negócio (NAP, redes, horários, política), use
 * `getBusinessSettings()` de `@/lib/business-settings` — esses são
 * editáveis no painel admin e ficam no banco.
 */
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
