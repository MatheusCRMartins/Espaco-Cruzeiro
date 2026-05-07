// Gera o briefing do Espaço Cruzeiro em .docx
// Baseado na estrutura do BRIEFING_GENUINOGRAN.docx, adaptado pro
// escopo: buffet/eventos + site institucional + sistema de reservas + admin.
//
// Paleta do projeto: verde #1d3a2c, dourado #d6b067, creme #f6f1e5.

const fs = require("fs");
const path = require("path");

// aponta pro docx instalado globalmente
const globalRoot = "C:\\Users\\Matheus Martins\\AppData\\Roaming\\npm\\node_modules";
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TabStopType, TabStopPosition,
} = require(path.join(globalRoot, "docx"));

// --------------------------------------------------------------- cores
const VERDE = "1D3A2C";
const DOURADO = "D6B067";
const CREME = "F6F1E5";
const CINZA = "4B4B4B";
const CINZA_CLARO = "CCCCCC";
const AMARELO_FUNDO = "FFF8E1";

// --------------------------------------------------------------- paginação
const PAGE_WIDTH  = 12240;
const PAGE_HEIGHT = 15840;
const MARGIN      = 1440;
const CONTENT     = PAGE_WIDTH - 2 * MARGIN; // 9360

// --------------------------------------------------------------- helpers
const border = { style: BorderStyle.SINGLE, size: 4, color: CINZA_CLARO };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, color: VERDE, font: "Arial", size: 32 })],
    spacing: { before: 360, after: 180 },
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, color: VERDE, font: "Arial", size: 26 })],
    spacing: { before: 280, after: 120 },
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, color: VERDE, font: "Arial", size: 22 })],
    spacing: { before: 200, after: 80 },
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22, color: CINZA, ...opts })],
    spacing: { after: 120 },
  });
}
function note(pre, body) {
  return new Paragraph({
    children: [
      new TextRun({ text: pre, bold: true, color: VERDE, font: "Arial", size: 20 }),
      new TextRun({ text: " " + body, color: CINZA, font: "Arial", size: 20 }),
    ],
    shading: { fill: CREME, type: ShadingType.CLEAR },
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: DOURADO, space: 4 },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: DOURADO, space: 4 },
      left: { style: BorderStyle.SINGLE, size: 4, color: DOURADO, space: 4 },
      right: { style: BorderStyle.SINGLE, size: 4, color: DOURADO, space: 4 },
    },
    spacing: { before: 160, after: 160 },
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: CINZA })],
  });
}

function checkItem(text) {
  return new Paragraph({
    numbering: { reference: "checks", level: 0 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: CINZA })],
  });
}

// campo label + espaço grande (subtítulo "____") sinalizando pro cliente preencher
function field(label, required = false, hint = "") {
  const runs = [
    new TextRun({ text: label, bold: true, color: VERDE, font: "Arial", size: 22 }),
  ];
  if (required) {
    runs.push(new TextRun({ text: " *", bold: true, color: "C0392B", font: "Arial", size: 22 }));
  }
  runs.push(new TextRun({ text: "  ", font: "Arial", size: 22 }));
  // underline de preenchimento
  runs.push(new TextRun({
    text: "_____________________________________________________________",
    color: CINZA_CLARO, font: "Arial", size: 22,
  }));
  const out = [new Paragraph({ children: runs, spacing: { before: 120, after: hint ? 40 : 120 } })];
  if (hint) {
    out.push(new Paragraph({
      children: [new TextRun({ text: hint, italics: true, color: CINZA, font: "Arial", size: 18 })],
      spacing: { after: 120 },
    }));
  }
  return out;
}

// célula de tabela
function cell(text, opts = {}) {
  const {
    bold = false, color = CINZA, fill = "FFFFFF",
    align = AlignmentType.LEFT, width,
  } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, bold, color, font: "Arial", size: 20 })],
    })],
  });
}

// --------------------------------------------------------------- capa
function cover() {
  const out = [];
  // barra visual superior (parágrafo com shading e altura via quebras)
  out.push(new Paragraph({
    children: [new TextRun({ text: "BRIEFING DO CLIENTE", bold: true, color: DOURADO, font: "Arial", size: 22 })],
    shading: { fill: VERDE, type: ShadingType.CLEAR },
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: VERDE },
      bottom: { style: BorderStyle.SINGLE, size: 24, color: DOURADO },
      left: { style: BorderStyle.SINGLE, size: 4, color: VERDE },
      right: { style: BorderStyle.SINGLE, size: 4, color: VERDE },
    },
    spacing: { after: 600 },
  }));
  out.push(new Paragraph({ children: [new TextRun("")], spacing: { after: 800 } }));
  out.push(new Paragraph({
    children: [new TextRun({ text: "Documento de Briefing", color: DOURADO, font: "Arial", size: 24 })],
    spacing: { after: 120 },
  }));
  out.push(new Paragraph({
    children: [new TextRun({ text: "Espaço Cruzeiro", bold: true, color: VERDE, font: "Arial", size: 64 })],
    spacing: { after: 160 },
  }));
  out.push(new Paragraph({
    children: [new TextRun({
      text: "Buffet e Eventos — Osasco/SP",
      color: CINZA, font: "Arial", size: 28,
    })],
    spacing: { after: 360 },
  }));
  out.push(new Paragraph({
    children: [new TextRun({
      text: "Levantamento de Informações — Site Institucional, Sistema de Reservas e Painel Administrativo",
      color: CINZA, font: "Arial", size: 22,
    })],
    spacing: { after: 600 },
  }));
  out.push(new Paragraph({
    children: [new TextRun({
      text: "Versão 1.0  ·  Preencher antes do início do desenvolvimento",
      italics: true, color: CINZA, font: "Arial", size: 20,
    })],
    spacing: { after: 120 },
  }));
  out.push(new Paragraph({
    children: [
      new TextRun({ text: "Campos marcados com ", color: CINZA, font: "Arial", size: 20 }),
      new TextRun({ text: "*", bold: true, color: "C0392B", font: "Arial", size: 20 }),
      new TextRun({ text: " são obrigatórios para o lançamento do site.", color: CINZA, font: "Arial", size: 20 }),
    ],
  }));
  out.push(new Paragraph({ children: [new PageBreak()] }));
  return out;
}

// --------------------------------------------------------------- índice
function toc() {
  const out = [h1("Índice")];
  const items = [
    "1. Dados Cadastrais da Empresa",
    "2. Contato e Canais de Atendimento",
    "3. Identidade Visual e Marca",
    "4. Redes Sociais e Presença Digital",
    "5. Sobre o Espaço — Conteúdo do Site",
    "6. Tipos de Eventos Oferecidos",
    "7. Espaço Físico e Infraestrutura",
    "8. Pacotes, Valores e Regras de Reserva",
    "9. Cardápio e Bebidas",
    "10. Extras e Adicionais",
    "11. Agenda e Datas Bloqueadas",
    "12. Portfólio de Eventos Realizados",
    "13. Depoimentos e Avaliações",
    "14. Público-Alvo e Posicionamento",
    "15. Integrações e Pagamento Online",
    "16. Rastreamento e Ferramentas Digitais",
    "17. Domínio, E-mail e Hospedagem",
    "18. Checklist de Entrega de Materiais",
  ];
  for (const it of items) {
    out.push(new Paragraph({
      children: [new TextRun({ text: it, color: VERDE, font: "Arial", size: 22 })],
      spacing: { after: 80 },
    }));
  }
  out.push(new Paragraph({ children: [new PageBreak()] }));
  return out;
}

// --------------------------------------------------------------- seções
function sec1() {
  return [
    h1("1. Dados Cadastrais da Empresa"),
    ...field("Razão social", true),
    ...field("Nome fantasia", true),
    ...field("CNPJ", true),
    ...field("Inscrição estadual / municipal"),
    ...field("Endereço completo", true),
    ...field("Bairro", true),
    ...field("Cidade / UF / CEP", true),
    ...field("Responsável legal (nome completo)", true),
    ...field("Ano de fundação"),
  ];
}

function sec2() {
  return [
    h1("2. Contato e Canais de Atendimento"),
    note("Atenção:", "esses dados aparecem no site, no Google e nos e-mails automáticos de confirmação de reserva. Confirme todos com cuidado."),
    ...field("WhatsApp principal (com DDD)", true),
    ...field("Telefone fixo / segundo número"),
    ...field("E-mail profissional (receberá os pedidos de reserva)", true),
    ...field("E-mail secundário / financeiro"),
    ...field("Horário de atendimento", true),
    ...field("Atende nos finais de semana? Quais horários?"),
    ...field("Aceita visitas presenciais ao espaço? Como agendar?"),
  ];
}

function sec3() {
  return [
    h1("3. Identidade Visual e Marca"),
    note("Formatos aceitos:", "Logo em PNG (fundo transparente) ou SVG. Mínimo 800px de largura para web."),
    ...field("Logo versão principal", true, "(nome do arquivo ou link)"),
    ...field("Logo versão branca (para fundo escuro)"),
    ...field("Logo versão escura (para fundo claro)"),
    ...field("Símbolo / ícone isolado"),
    ...field("Cor principal (hex)", true, "ex: #1D3A2C (verde do projeto)"),
    ...field("Cor secundária", true, "ex: #D6B067 (dourado)"),
    ...field("Cor de fundo / base", false, "ex: #F6F1E5 (creme)"),
    ...field("Fonte principal (se souber)"),
    ...field("Manual de marca / brandbook"),
    ...field("Slogan / tagline oficial"),
  ];
}

function sec4() {
  return [
    h1("4. Redes Sociais e Presença Digital"),
    ...field("Instagram (@)", true),
    ...field("Facebook (link da página)"),
    ...field("TikTok (@)"),
    ...field("YouTube (link do canal)"),
    ...field("Google Meu Negócio (link)"),
    ...field("Avaliação média atual no Google"),
    ...field("Número de avaliações no Google"),
    ...field("Site atual, se existir"),
  ];
}

function sec5() {
  return [
    h1("5. Sobre o Espaço — Conteúdo do Site"),
    h2("5.1 História e posicionamento"),
    note("", "Esse texto vai na seção \"Sobre\" do site. Seja específico — anos, histórias reais e números aumentam credibilidade."),
    ...field("Como o Espaço Cruzeiro começou?", true),
    ...field("Quantos anos de atuação?"),
    ...field("Quantos eventos já realizou (estimativa)?"),
    ...field("Quantos colaboradores fixos e freelancers?"),
    ...field("Possui buffet próprio ou terceiriza a cozinha?"),
    ...field("Qual o maior evento que já realizou?"),
    h2("5.2 Diferenciais competitivos"),
    note("", "Por que o cliente deve escolher o Espaço Cruzeiro e não outro buffet? Liste pelo menos 4 motivos concretos."),
    diferenciaisTable(),
    h2("5.3 Área de atendimento"),
    ...field("Bairros / regiões em que o espaço está localizado"),
    ...field("Atende eventos fora do espaço (casa do cliente, chácaras, etc)?"),
    ...field("Se sim, qual o raio de cobertura?"),
    ...field("Cobra taxa de deslocamento? Como calcula?"),
    h2("5.4 Processo de contratação"),
    note("", "Descreva o passo a passo: desde o primeiro contato até o evento. O site vai espelhar esse fluxo."),
    ...field("Como funciona a visita / apresentação do espaço?"),
    ...field("Quanto tempo de antecedência é recomendado reservar?"),
    ...field("Prazo mínimo para cancelamento ou alteração"),
    ...field("Oferece garantia ou plano B em caso de imprevisto?"),
  ];
}

function diferenciaisTable() {
  const w = [720, 4000, 4640];
  const rows = [
    new TableRow({
      children: [
        cell("#", { bold: true, color: VERDE, fill: CREME, width: w[0], align: AlignmentType.CENTER }),
        cell("Diferencial", { bold: true, color: VERDE, fill: CREME, width: w[1] }),
        cell("Como provar / evidência", { bold: true, color: VERDE, fill: CREME, width: w[2] }),
      ],
    }),
  ];
  for (let i = 1; i <= 5; i++) {
    rows.push(new TableRow({
      children: [
        cell(String(i), { width: w[0], align: AlignmentType.CENTER, color: VERDE, bold: true }),
        cell("", { width: w[1] }),
        cell("", { width: w[2] }),
      ],
      height: { value: 700, rule: "atLeast" },
    }));
  }
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: w,
    rows,
  });
}

function sec6() {
  const out = [
    h1("6. Tipos de Eventos Oferecidos"),
    note("Importante:", "cada tipo de evento vira um bloco separado no site e no sistema de reservas. O cliente escolhe o tipo, o calendário filtra horários e o formulário abre com os campos certos."),
  ];
  const tipos = [
    { n: "Aniversário infantil", hint: "crianças de 1 a 12 anos" },
    { n: "Aniversário adulto", hint: "15, 18, 30, 40, 50… anos" },
    { n: "Casamento / renovação de votos", hint: "" },
    { n: "Noivado / chá de panela", hint: "" },
    { n: "Chá revelação", hint: "" },
    { n: "Formatura / colação", hint: "" },
    { n: "Evento corporativo", hint: "confraternização, palestra, lançamento" },
    { n: "Bodas (10, 25, 50 anos de casamento)", hint: "" },
    { n: "Outros tipos (batizado, bar mitzvá, velório…)", hint: "liste abaixo" },
  ];
  for (const t of tipos) {
    out.push(...field(`Oferece ${t.n.toLowerCase()}? (S/N)`, false, t.hint));
  }
  out.push(h3("Para cada tipo oferecido, preencha um bloco abaixo"));
  for (let i = 1; i <= 4; i++) {
    out.push(h3(`Tipo de evento ${i}`));
    out.push(...field("Nome do tipo de evento", true));
    out.push(...field("Descrição resumida (2–4 linhas)", true));
    out.push(...field("Capacidade mínima e máxima de convidados"));
    out.push(...field("Duração padrão do evento (em horas)"));
    out.push(...field("Valor inicial (sob consulta ou valor fixo)"));
    out.push(...field("Dias da semana em que é oferecido"));
    out.push(...field("É o mais pedido? Qual o volume médio por mês?"));
  }
  return out;
}

function sec7() {
  return [
    h1("7. Espaço Físico e Infraestrutura"),
    note("Por quê:", "essas informações viram a página 'Espaço' do site e ficam visíveis pro cliente antes dele reservar. Transparência reduz dúvidas e aumenta conversão."),
    ...field("Área total (m²)", true),
    ...field("Capacidade máxima (convidados sentados)", true),
    ...field("Capacidade máxima (convidados em pé)"),
    ...field("Possui estacionamento próprio? Quantas vagas?"),
    ...field("Acessibilidade (rampa, banheiro PCD)?"),
    ...field("Ar-condicionado? Em quais áreas?"),
    ...field("Som ambiente? Possui estrutura de DJ/banda?"),
    ...field("Iluminação cênica disponível?"),
    ...field("Telão / projetor para apresentações?"),
    ...field("Cozinha industrial estruturada?"),
    ...field("Fraldário ou espaço kids?"),
    ...field("Vestiário / camarim dos noivos?"),
    h3("Fotos do espaço"),
    p("Envie ao menos 12 fotos em alta resolução (mínimo 1200px de largura) cobrindo: fachada, salão vazio, salão decorado, cozinha, áreas externas, banheiros e estacionamento."),
    ...field("Link da pasta com fotos (Google Drive / Dropbox)", true),
    ...field("Possui vídeo de apresentação do espaço? (tour virtual)"),
    ...field("Plantas ou croqui do espaço?"),
  ];
}

function sec8() {
  const out = [
    h1("8. Pacotes, Valores e Regras de Reserva"),
    note("Crítico:", "o sistema de reservas precisa desses dados pra calcular preço, montar a proposta automática e cobrar a entrada via Mercado Pago. Sem isso, o fluxo de reserva não funciona."),
    h2("8.1 Estrutura de pacotes"),
    p("Preencha um bloco por pacote (ex: Essencial, Completo, Premium). No mínimo 2 pacotes recomendado."),
  ];
  for (let i = 1; i <= 3; i++) {
    out.push(h3(`Pacote ${i}`));
    out.push(...field("Nome do pacote", true));
    out.push(...field("O que está incluso (descrição completa)", true));
    out.push(...field("Valor base (por evento ou por convidado?)", true));
    out.push(...field("Convidados mínimos inclusos"));
    out.push(...field("Valor adicional por convidado extra"));
    out.push(...field("Duração inclusa (em horas)"));
    out.push(...field("Valor da hora extra"));
  }
  out.push(h2("8.2 Regras de pagamento"));
  out.push(...field("Valor do sinal / entrada (% ou R$)", true, "ex: 30% no ato da reserva"));
  out.push(...field("Em quantas parcelas o restante pode ser pago?"));
  out.push(...field("Até quantos dias antes do evento o saldo deve estar quitado?", true));
  out.push(...field("Aceita PIX, cartão, transferência? Todos?"));
  out.push(h2("8.3 Regras de cancelamento"));
  out.push(...field("Cancelamento com mais de 60 dias de antecedência: reembolsa o sinal?", true));
  out.push(...field("Cancelamento entre 30 e 60 dias", true));
  out.push(...field("Cancelamento com menos de 30 dias", true));
  out.push(...field("Política de remarcação (reagendar sem perder o sinal?)"));
  return out;
}

function sec9() {
  const out = [
    h1("9. Cardápio e Bebidas"),
    note("", "O cardápio aparece como menu detalhado no site. Se o espaço não serve comida, pule esta seção e marque abaixo."),
    ...field("O Espaço Cruzeiro fornece o cardápio? (S/N)", true),
    ...field("Se não, trabalha com fornecedores parceiros? Quais?"),
    h2("9.1 Cardápio oferecido"),
  ];
  const categorias = [
    "Entradas / couvert",
    "Pratos principais",
    "Guarnições",
    "Sobremesas",
    "Mesa de frios",
    "Docinhos e bem-casados",
    "Bolo do evento",
  ];
  for (const c of categorias) {
    out.push(...field(c, false, "liste os itens oferecidos"));
  }
  out.push(h2("9.2 Bebidas"));
  out.push(...field("Refrigerantes e sucos (liste as marcas)"));
  out.push(...field("Água mineral (com/sem gás, qual marca)"));
  out.push(...field("Cerveja (quais marcas e tipos)"));
  out.push(...field("Espumantes / vinhos"));
  out.push(...field("Drinks / bar aberto? Quais coquetéis?"));
  out.push(...field("É permitido o cliente levar bebida própria? Tem taxa de rolha?"));
  out.push(h2("9.3 Restrições alimentares"));
  out.push(...field("Oferece opções vegetarianas?"));
  out.push(...field("Opções sem glúten ou sem lactose?"));
  out.push(...field("Cozinha kosher ou halal sob encomenda?"));
  return out;
}

function sec10() {
  return [
    h1("10. Extras e Adicionais"),
    note("Como funciona no site:", "cada extra vira um 'checkbox' no formulário de reserva. O sistema soma o valor automaticamente no total antes do pagamento."),
    p("Para cada item abaixo, informe se é oferecido, o valor e se é interno ou via parceiro."),
    extrasTable(),
    h3("Outros extras"),
    p("Liste itens não cobertos pela tabela acima (ex: lembrancinhas, brigadeiro de colher extra, transporte de convidados)."),
    ...field("Extras adicionais oferecidos"),
  ];
}

function extrasTable() {
  const w = [3200, 1800, 2000, 2360];
  const rows = [
    new TableRow({
      children: [
        cell("Item", { bold: true, color: VERDE, fill: CREME, width: w[0] }),
        cell("Oferece? (S/N)", { bold: true, color: VERDE, fill: CREME, width: w[1], align: AlignmentType.CENTER }),
        cell("Valor", { bold: true, color: VERDE, fill: CREME, width: w[2], align: AlignmentType.CENTER }),
        cell("Interno / parceiro", { bold: true, color: VERDE, fill: CREME, width: w[3] }),
      ],
    }),
  ];
  const items = [
    "Decoração temática",
    "Decoração floral",
    "DJ / som profissional",
    "Banda ao vivo",
    "Cerimonial / assessoria",
    "Fotógrafo",
    "Filmagem / drone",
    "Bolo personalizado",
    "Mesa de doces decorada",
    "Chocolate fountain",
    "Brinquedos / pula-pula (infantil)",
    "Recreação / monitor infantil",
    "Máquina de algodão doce / pipoca",
    "Segurança privada",
    "Manobrista / valet",
    "Convites impressos",
  ];
  for (const it of items) {
    rows.push(new TableRow({
      children: [
        cell(it, { width: w[0] }),
        cell("", { width: w[1] }),
        cell("", { width: w[2] }),
        cell("", { width: w[3] }),
      ],
    }));
  }
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: w,
    rows,
  });
}

function sec11() {
  return [
    h1("11. Agenda e Datas Bloqueadas"),
    note("Por quê:", "o calendário do site começa a operar na data do lançamento. Precisamos saber o que já está vendido e o que é feriado/folga pra não gerar reservas conflitantes."),
    h2("11.1 Datas já reservadas"),
    p("Liste todas as datas já comprometidas, de hoje até o fim do ano seguinte. Inclua tipo de evento, nome do cliente e status do pagamento."),
    ...field("Link da planilha / lista de eventos já reservados", true),
    h2("11.2 Datas bloqueadas (folgas, férias, manutenção)"),
    p("Datas em que o espaço NÃO aceita reservas, mesmo se estiverem livres."),
    ...field("Feriados em que não funciona"),
    ...field("Período de férias coletivas / manutenção"),
    ...field("Dias da semana em que nunca abre"),
    h2("11.3 Horários padrão"),
    ...field("Horário padrão de início dos eventos (almoço / jantar / noite)"),
    ...field("Duração padrão (horas)"),
    ...field("Pode fazer 2 eventos no mesmo dia? Qual o intervalo mínimo?"),
    ...field("Horário de 'entrada' (montagem) e 'saída' (desmontagem)"),
  ];
}

function sec12() {
  const out = [
    h1("12. Portfólio de Eventos Realizados"),
    note("Fotos convertem:", "este é um dos fatores que mais pesa na decisão do cliente. Quanto mais eventos reais no site, maior a credibilidade. Mínimo 8 eventos, ideal 20+."),
    p("Requisitos técnicos: fotos em alta resolução (mínimo 1200px), boa iluminação, sem marca d'água. Formatos aceitos: JPG ou PNG."),
    portfolioTable(),
    ...field("Link da pasta com o portfólio completo (Drive, Dropbox)", true),
    ...field("Possui vídeos curtos de eventos realizados?"),
    ...field("Tem autorização de imagem dos convidados nas fotos?"),
  ];
  return out;
}

function portfolioTable() {
  const w = [560, 2400, 2000, 1700, 1350, 1350];
  const rows = [
    new TableRow({
      children: [
        cell("#", { bold: true, color: VERDE, fill: CREME, width: w[0], align: AlignmentType.CENTER }),
        cell("Tipo de evento", { bold: true, color: VERDE, fill: CREME, width: w[1] }),
        cell("Nome / tema", { bold: true, color: VERDE, fill: CREME, width: w[2] }),
        cell("Mês/Ano", { bold: true, color: VERDE, fill: CREME, width: w[3], align: AlignmentType.CENTER }),
        cell("Tem foto HD?", { bold: true, color: VERDE, fill: CREME, width: w[4], align: AlignmentType.CENTER }),
        cell("Pode divulgar?", { bold: true, color: VERDE, fill: CREME, width: w[5], align: AlignmentType.CENTER }),
      ],
    }),
  ];
  for (let i = 1; i <= 10; i++) {
    rows.push(new TableRow({
      children: [
        cell(String(i), { width: w[0], align: AlignmentType.CENTER, color: VERDE, bold: true }),
        cell("", { width: w[1] }),
        cell("", { width: w[2] }),
        cell("", { width: w[3], align: AlignmentType.CENTER }),
        cell("S / N", { width: w[4], align: AlignmentType.CENTER, color: CINZA_CLARO }),
        cell("S / N", { width: w[5], align: AlignmentType.CENTER, color: CINZA_CLARO }),
      ],
    }));
  }
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: w,
    rows,
  });
}

function sec13() {
  const out = [
    h1("13. Depoimentos e Avaliações"),
    note("", "Depoimentos reais são essenciais para conversão. Colete ao menos 5. Pode ser do Google, WhatsApp, Instagram ou por escrito."),
  ];
  for (let i = 1; i <= 5; i++) {
    out.push(h3(`Depoimento ${i}`));
    out.push(...field("Nome do cliente"));
    out.push(...field("Tipo de evento realizado"));
    out.push(...field("Mês e ano do evento"));
    out.push(...field("Texto do depoimento"));
    out.push(...field("Nota (1 a 5 estrelas)"));
    out.push(...field("Foto do cliente ou do evento (opcional)"));
    out.push(...field("Autorização de uso? (S/N)"));
  }
  return out;
}

function sec14() {
  return [
    h1("14. Público-Alvo e Posicionamento"),
    note("", "Essas informações definem tom do site, prioridade das páginas e (se houver tráfego pago no futuro) segmentação dos anúncios."),
    h2("14.1 Cliente ideal"),
    ...field("Faixa etária do cliente típico"),
    ...field("Gênero predominante de quem fecha a reserva"),
    ...field("Renda / classe social"),
    ...field("Bairros / regiões que mais contratam"),
    ...field("Perfil (família, casais, empresas, organizadores de evento)"),
    ...field("Motivo mais comum da contratação"),
    ...field("Principal dúvida / objeção do cliente antes de fechar"),
    h2("14.2 Concorrentes diretos"),
    concorrentesTable(),
    h2("14.3 Tom de voz"),
    ...field("Como quer ser percebido? (luxo / acolhedor / tradicional / moderno…)"),
    ...field("Palavras que representam o Espaço Cruzeiro"),
    ...field("Palavras que NÃO representam o Espaço Cruzeiro"),
    ...field("Referências de sites / buffets que admira (links)"),
  ];
}

function concorrentesTable() {
  const w = [2500, 2400, 2230, 2230];
  const rows = [
    new TableRow({
      children: [
        cell("Nome do concorrente", { bold: true, color: VERDE, fill: CREME, width: w[0] }),
        cell("Site / Instagram", { bold: true, color: VERDE, fill: CREME, width: w[1] }),
        cell("Ponto fraco deles", { bold: true, color: VERDE, fill: CREME, width: w[2] }),
        cell("Ponto forte deles", { bold: true, color: VERDE, fill: CREME, width: w[3] }),
      ],
    }),
  ];
  for (let i = 0; i < 4; i++) {
    rows.push(new TableRow({
      children: [
        cell("", { width: w[0] }),
        cell("", { width: w[1] }),
        cell("", { width: w[2] }),
        cell("", { width: w[3] }),
      ],
      height: { value: 600, rule: "atLeast" },
    }));
  }
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: w,
    rows,
  });
}

function sec15() {
  return [
    h1("15. Integrações e Pagamento Online"),
    note("Por quê:", "o sistema de reserva cobra o sinal direto pelo Mercado Pago e dispara e-mails automáticos pelo Resend. Precisamos das credenciais antes do go-live."),
    h2("15.1 Mercado Pago (pagamento do sinal)"),
    ...field("E-mail que será dono da conta Mercado Pago", true),
    ...field("CPF ou CNPJ que vai receber o dinheiro", true),
    ...field("Conta bancária / PIX para recebimento"),
    ...field("Já possui conta Mercado Pago? (S/N)"),
    h2("15.2 Resend (e-mails automáticos)"),
    ...field("E-mail remetente (aparecerá no inbox do cliente)", true, "ex: reservas@espacocruzeiro.com.br"),
    ...field("Nome do remetente", true, "ex: Espaço Cruzeiro — Reservas"),
    ...field("E-mail que recebe cópia de todas as reservas", true),
    h2("15.3 Supabase (banco de dados + login do admin)"),
    ...field("E-mail que será dono da conta Supabase", true),
    ...field("E-mail(s) que precisam de acesso ao painel admin", true),
    ...field("Nome completo de cada admin (pro e-mail de boas-vindas)", true),
  ];
}

function sec16() {
  return [
    h1("16. Rastreamento e Ferramentas Digitais"),
    note("", "Opcional no lançamento, mas recomendado. Sem esses itens, não é possível medir o retorno de anúncios pagos ou entender o comportamento dos visitantes."),
    ...field("E-mail para criar conta Google (Analytics)"),
    ...field("Já tem conta Google Analytics 4? (S/N)"),
    ...field("ID do Google Analytics 4 (se já tiver)", false, "começa com G-"),
    ...field("Já tem Meta Pixel criado? (S/N)"),
    ...field("ID do Meta Pixel (se já tiver)", false, "número de 15 dígitos"),
    ...field("Acesso ao Google Meu Negócio? (S/N)"),
    ...field("E-mail do Google Meu Negócio"),
  ];
}

function sec17() {
  return [
    h1("17. Domínio, E-mail e Hospedagem"),
    ...field("Domínio desejado", true, "ex: espacocruzeiro.com.br"),
    ...field("Já tem domínio registrado? (S/N)", true),
    ...field("Registrado em qual plataforma?", false, "Registro.br, GoDaddy, etc."),
    ...field("Login / acesso ao painel do domínio"),
    ...field("E-mail profissional contratado? (S/N)", false, "ex: contato@espacocruzeiro.com.br"),
    ...field("Se sim, em qual provedor?", false, "Google Workspace, Zoho Mail, etc."),
  ];
}

function sec18() {
  return [
    h1("18. Checklist de Entrega de Materiais"),
    p("Marque o que já está disponível e envie tudo em uma pasta no Google Drive compartilhada com acesso de editor."),
    h2("Obrigatórios para lançar o site"),
    checkItem("Logo em PNG com fundo transparente (mínimo 800px)"),
    checkItem("WhatsApp real com DDD confirmado"),
    checkItem("E-mail profissional ativo (receberá os pedidos de reserva)"),
    checkItem("Mínimo 12 fotos do espaço em alta resolução"),
    checkItem("Textos dos pacotes e serviços revisados e aprovados"),
    checkItem("Valores definidos: pacotes, convidado extra, hora extra"),
    checkItem("Política de sinal, pagamento e cancelamento definida"),
    checkItem("Conta Mercado Pago criada e verificada"),
    checkItem("Domínio registrado e acessível"),
    h2("Obrigatórios para o sistema de reservas"),
    checkItem("Lista de eventos já reservados até o go-live"),
    checkItem("Lista de datas bloqueadas (feriados / férias / folgas)"),
    checkItem("Credenciais do Mercado Pago (access token de produção)"),
    checkItem("Domínio de e-mail verificado no Resend (pra envio automático)"),
    checkItem("E-mails dos administradores que terão acesso ao painel"),
    h2("Para maximizar conversão (recomendados)"),
    checkItem("Mínimo 5 depoimentos reais de clientes (com autorização)"),
    checkItem("Mínimo 8 eventos completos no portfólio com fotos em HD"),
    checkItem("Vídeo de apresentação do espaço (tour virtual, 60–90 seg)"),
    checkItem("Foto profissional da equipe / fachada"),
    checkItem("Certificados ou prêmios (se houver)"),
    checkItem("Parcerias com cerimoniais / fotógrafos / decoradores"),
    checkItem("Acesso ao Google Meu Negócio atualizado"),
    h2("Entrega"),
    ...field("Link da pasta de materiais (Google Drive / Dropbox)", true),
    ...field("Data limite de entrega dos materiais", true),
    ...field("Observações adicionais"),
    new Paragraph({ children: [new TextRun("")], spacing: { before: 400 } }),
    new Paragraph({
      children: [new TextRun({
        text: "Documento gerado para o projeto Espaço Cruzeiro  ·  Preencher e devolver antes do início da produção",
        italics: true, color: CINZA, font: "Arial", size: 18,
      })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Campos com ", color: CINZA, font: "Arial", size: 18 }),
        new TextRun({ text: "*", bold: true, color: "C0392B", font: "Arial", size: 18 }),
        new TextRun({ text: " são obrigatórios para o lançamento.", color: CINZA, font: "Arial", size: 18 }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  ];
}

// --------------------------------------------------------------- document
const doc = new Document({
  creator: "Espaço Cruzeiro",
  title: "Briefing do cliente — Espaço Cruzeiro",
  description: "Documento de levantamento de informações pro site institucional, sistema de reservas e painel administrativo.",
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22, color: CINZA } },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: VERDE },
        paragraph: {
          spacing: { before: 360, after: 180 },
          outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: DOURADO, space: 4 } },
        },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: VERDE },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: VERDE },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "checks",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "☐", alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 720, hanging: 360 } },
            run: { font: "Arial", size: 22, color: VERDE },
          },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: "Espaço Cruzeiro", color: CINZA, font: "Arial", size: 18 }),
            new TextRun({ text: "\tBriefing do cliente", color: CINZA, font: "Arial", size: 18 }),
          ],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: CINZA_CLARO, space: 4 } },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "Página ", color: CINZA, font: "Arial", size: 18 }),
            new TextRun({ children: [PageNumber.CURRENT], color: CINZA, font: "Arial", size: 18 }),
          ],
        })],
      }),
    },
    children: [
      ...cover(),
      ...toc(),
      ...sec1(),
      ...sec2(),
      ...sec3(),
      ...sec4(),
      ...sec5(),
      ...sec6(),
      ...sec7(),
      ...sec8(),
      ...sec9(),
      ...sec10(),
      ...sec11(),
      ...sec12(),
      ...sec13(),
      ...sec14(),
      ...sec15(),
      ...sec16(),
      ...sec17(),
      ...sec18(),
    ],
  }],
});

// --------------------------------------------------------------- write
const out = path.join(__dirname, "BRIEFING_ESPACO_CRUZEIRO.docx");
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(out, buffer);
  console.log("OK:", out);
});
