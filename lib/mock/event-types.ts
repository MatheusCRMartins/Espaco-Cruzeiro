/**
 * MOCK event types. Source of truth for Phase 2 visuals.
 * Phase 4 replaces this with data from Supabase (event_types table).
 */
export type EventTypeMock = {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  minGuests: number;
  maxGuests: number;
  basePricePerPerson: number; // placeholder until client confirms
  durationHours: number;
  highlights: string[];
  heroBg: string; // tailwind bg class (placeholder for real hero photo)
};

export const EVENT_TYPES: EventTypeMock[] = [
  {
    slug: "casamentos",
    name: "Casamentos",
    shortDescription:
      "Uma cerimônia íntima ou uma festa inesquecível — o espaço se adapta ao seu dia.",
    longDescription:
      "Do \"sim\" sob iluminação cênica à pista cheia até o amanhecer. Oferecemos decoração, buffet completo, equipe de atendimento e estrutura para cerimônia + recepção no mesmo local.",
    minGuests: 50,
    maxGuests: 150,
    basePricePerPerson: 250,
    durationHours: 8,
    highlights: [
      "Cerimônia e recepção no mesmo espaço",
      "Iluminação cênica e sonorização",
      "Buffet completo com chef responsável",
      "Equipe de coordenação no dia",
    ],
    heroBg:
      "bg-[radial-gradient(ellipse_at_top,theme(colors.accent/30),transparent_60%),linear-gradient(135deg,theme(colors.primary)_0%,theme(colors.primary)_100%)]",
  },
  {
    slug: "aniversarios",
    name: "Aniversários",
    shortDescription:
      "De festas infantis animadas a celebrações elegantes de vida adulta.",
    longDescription:
      "Brinquedos, estrutura kids, cardápio infantil e adulto, decoração temática. Para aniversários de adultos, apostamos em ambientação acolhedora e jantar servido.",
    minGuests: 30,
    maxGuests: 150,
    basePricePerPerson: 180,
    durationHours: 6,
    highlights: [
      "Brinquedos infantis inclusos",
      "Cardápio infantil e adulto",
      "Decoração temática sob medida",
      "Estacionamento próprio",
    ],
    heroBg:
      "bg-[radial-gradient(ellipse_at_top,theme(colors.accent/40),transparent_60%)]",
  },
  {
    slug: "cha-de-bebe",
    name: "Chá de bebê",
    shortDescription:
      "Um dia acolhedor para celebrar a chegada que muda tudo.",
    longDescription:
      "Ambientação delicada, brunch servido, brincadeiras e espaço para fotos memoráveis. A equipe cuida dos detalhes para você viver o momento com a família.",
    minGuests: 20,
    maxGuests: 80,
    basePricePerPerson: 150,
    durationHours: 5,
    highlights: [
      "Brunch ou menu sob medida",
      "Decoração delicada inclusa",
      "Espaço para brincadeiras",
      "Cantinho de fotos",
    ],
    heroBg:
      "bg-[linear-gradient(135deg,theme(colors.secondary),theme(colors.background))]",
  },
  {
    slug: "revelacao",
    name: "Chá revelação",
    shortDescription:
      "O momento mais esperado da gestação — no clima certo, com todos juntos.",
    longDescription:
      "Efeitos especiais (fumaça colorida, confetes ou balões), registro em vídeo e ambientação surpresa. A equipe coordena o timing com você para que o reveal seja perfeito.",
    minGuests: 20,
    maxGuests: 80,
    basePricePerPerson: 160,
    durationHours: 4,
    highlights: [
      "Efeitos especiais para o reveal",
      "Coordenação do momento",
      "Buffet e decoração temática",
      "Registro da surpresa",
    ],
    heroBg:
      "bg-[radial-gradient(ellipse_at_center,theme(colors.accent/50),theme(colors.primary))]",
  },
  {
    slug: "corporativos",
    name: "Eventos corporativos",
    shortDescription:
      "Confraternizações, lançamentos, treinamentos e reuniões executivas.",
    longDescription:
      "Estrutura de projeção, som, wi-fi, coffee break e jantar executivo. Local a 15 minutos da Marginal Tietê, com estacionamento e acessibilidade.",
    minGuests: 30,
    maxGuests: 150,
    basePricePerPerson: 140,
    durationHours: 6,
    highlights: [
      "Projeção e sonorização profissional",
      "Coffee break e jantar executivo",
      "Wi-Fi dedicado",
      "Nota fiscal emitida",
    ],
    heroBg:
      "bg-[linear-gradient(135deg,theme(colors.primary),theme(colors.muted))]",
  },
  {
    slug: "confraternizacoes",
    name: "Confraternizações",
    shortDescription:
      "Fim de ano, aniversário da empresa ou reencontro de amigos — nós preparamos.",
    longDescription:
      "Menu generoso, ambiente descontraído, espaço para DJ ou banda ao vivo. Pacotes flexíveis para grupos pequenos ou a empresa inteira.",
    minGuests: 30,
    maxGuests: 150,
    basePricePerPerson: 170,
    durationHours: 6,
    highlights: [
      "Menu farto e variado",
      "Espaço para DJ ou banda",
      "Atendimento à vontade",
      "Flexibilidade para grupos grandes",
    ],
    heroBg:
      "bg-[radial-gradient(ellipse_at_top_right,theme(colors.accent/40),theme(colors.primary))]",
  },
];

export function getEventType(slug: string) {
  return EVENT_TYPES.find((e) => e.slug === slug);
}
