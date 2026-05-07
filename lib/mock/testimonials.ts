export type TestimonialMock = {
  name: string;
  eventType: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  date: string;
};

/** TODO: replace with real testimonials from the client. */
export const TESTIMONIALS: TestimonialMock[] = [
  {
    name: "Carolina & Rafael",
    eventType: "Casamento",
    rating: 5,
    content:
      "A equipe cuidou de cada detalhe do nosso casamento. Nossos convidados ainda comentam da comida e da estrutura. Valeu cada centavo.",
    date: "Set 2025",
  },
  {
    name: "Juliana S.",
    eventType: "Aniversário de 1 ano",
    rating: 5,
    content:
      "Meu filho amou, e as crianças nem queriam ir embora. Decoração linda, atendimento impecável. Já estamos planejando o próximo!",
    date: "Jul 2025",
  },
  {
    name: "Marina & Pedro",
    eventType: "Chá revelação",
    rating: 5,
    content:
      "O reveal ficou absolutamente perfeito. Coordenaram tudo com a gente e ainda deram várias dicas que a gente não tinha pensado.",
    date: "Mai 2025",
  },
  {
    name: "Equipe Horizonte",
    eventType: "Confraternização corporativa",
    rating: 5,
    content:
      "Fizemos nossa festa de fim de ano e foi o melhor evento da empresa em anos. Estrutura, comida e atendimento excelentes.",
    date: "Dez 2024",
  },
  {
    name: "Fernanda M.",
    eventType: "Chá de bebê",
    rating: 5,
    content:
      "Ambiente delicado, brunch delicioso e uma atenção enorme comigo e com minhas convidadas. Foi o dia mais especial.",
    date: "Abr 2025",
  },
  {
    name: "Lucas & Beatriz",
    eventType: "Casamento",
    rating: 5,
    content:
      "Buscamos vários lugares em Osasco e escolhemos o Espaço Cruzeiro pelo carinho no atendimento. Não nos arrependemos nenhum segundo.",
    date: "Fev 2025",
  },
];
