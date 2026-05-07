"""
PDF 3 — Documentação técnica didática do projeto Espaço Cruzeiro.
Explica o projeto de ponta a ponta pra alguém que está começando
em programação. Aborda conceitos, estrutura de pastas e o que cada
arquivo faz, com linguagem simples e exemplos.
"""
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether,
)
from reportlab.lib import colors

from _style import (
    VERDE, DOURADO, CREME, CINZA, CINZA_CLARO,
    MARGIN, build_styles,
    make_page_decorator, make_cover_decorator,
)

OUT = Path(__file__).with_name("03_documentacao_tecnica.pdf")
styles = build_styles()


# ----------------------------------------------------------------- utils
def h1(text):   return Paragraph(text, styles["H1"])
def h2(text):   return Paragraph(text, styles["H2"])
def h3(text):   return Paragraph(text, styles["H3"])
def p(text):    return Paragraph(text, styles["Body"])
def small(text):return Paragraph(text, styles["Small"])
def bullet(text):return Paragraph(text, styles["MyBullet"], bulletText="•")
def callout(text):return Paragraph(text, styles["Callout"])
def code(text):
    # escapa < e > pra Paragraph não interpretar como tag
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # quebra de linha -> <br/>
    text = text.replace("\n", "<br/>")
    return Paragraph(text, styles["MyCode"])

def spacer(h=0.4):
    return Spacer(1, h * cm)


def two_col_table(rows, col1_width=5.5 * cm):
    """Tabela de 2 colunas pra explicar coisas ("label": "descrição")."""
    available = A4[0] - 2 * MARGIN
    t = Table(
        rows,
        colWidths=[col1_width, available - col1_width],
        hAlign="LEFT",
    )
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), CREME),
        ("TEXTCOLOR", (0, 0), (0, -1), VERDE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("TEXTCOLOR", (1, 0), (1, -1), CINZA),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, CINZA_CLARO),
        ("BOX", (0, 0), (-1, -1), 0.5, CINZA_CLARO),
    ]))
    return t


# ------------------------------------------------------------------ capa
def cover():
    elems = []
    elems.append(Spacer(1, 6 * cm))
    elems.append(Paragraph("DOCUMENTO 03", styles["CoverEyebrow"]))
    elems.append(Paragraph(
        "Documentação<br/>técnica do projeto",
        styles["CoverTitle"],
    ))
    elems.append(Paragraph(
        "Uma visita guiada pelo código, pelas pastas e pelos conceitos "
        "de programação por trás do site e do sistema de reservas do "
        "Espaço Cruzeiro.",
        styles["CoverSubtitle"],
    ))
    elems.append(Spacer(1, 3 * cm))
    elems.append(Paragraph(
        "Para: Matheus (dono do projeto)<br/>"
        "Objetivo: aprender enquanto entende o que foi feito<br/>"
        "Versão: 1.0",
        styles["CoverMeta"],
    ))
    elems.append(PageBreak())
    return elems


# ------------------------------------------------------------ sumário
def toc():
    elems = [h1("Sumário")]
    items = [
        "1. Como ler este documento",
        "2. Conceitos básicos — o que é um site moderno",
        "3. As tecnologias do projeto, uma por uma",
        "4. A estrutura de pastas",
        "5. O que cada arquivo faz (tour guiado)",
        "6. Os fluxos principais do sistema",
        "7. Conceitos de programação que você aprendeu aqui",
        "8. Como o projeto evolui daqui pra frente",
        "9. Glossário rápido",
    ]
    for i in items:
        elems.append(Paragraph(i, styles["TOCItem"]))
    elems.append(PageBreak())
    return elems


# --------------------------------------------------------- 1. Como ler
def secao_1():
    elems = [h1("1. Como ler este documento")]
    elems.append(p(
        "Este PDF foi escrito pra você que <b>não programa</b>, mas quer "
        "entender o que está dentro do projeto que desenvolvi pro Espaço "
        "Cruzeiro. A ideia é dupla: servir como referência do sistema e, "
        "de quebra, te ensinar os conceitos de programação web mais "
        "comuns, com exemplos reais tirados do seu próprio código."
    ))
    elems.append(h3("Como ele está organizado"))
    elems.append(bullet(
        "Começamos do zero, explicando o que é um site moderno e por que "
        "ele é diferente de uma página estática dos anos 2000."))
    elems.append(bullet(
        "Depois apresentamos uma por uma as tecnologias usadas e pra que "
        "cada uma serve."))
    elems.append(bullet(
        "Em seguida fazemos um <b>tour guiado</b> pela estrutura de "
        "pastas e pelos arquivos, explicando o papel de cada um."))
    elems.append(bullet(
        "No final, voltamos em conceitos de programação que apareceram "
        "no caminho, pra fechar com chave de ouro."))
    elems.append(spacer())
    elems.append(callout(
        "Dica: não precisa ler tudo de uma vez. Use o sumário. Se uma "
        "seção parecer muito densa, pule, continue, e volte depois. "
        "Programação é feita de camadas — cada releitura revela algo novo."
    ))
    elems.append(PageBreak())
    return elems


# --------------------------------------------------- 2. Conceitos básicos
def secao_2():
    elems = [h1("2. Conceitos básicos — o que é um site moderno")]

    elems.append(h2("2.1 Frontend vs Backend"))
    elems.append(p(
        "Todo sistema web tem dois lados. O <b>frontend</b> é tudo que o "
        "usuário vê e clica: botões, formulários, menus. Ele roda dentro "
        "do navegador (Chrome, Safari, etc). O <b>backend</b> é tudo que "
        "acontece nos bastidores: salvar uma reserva no banco de dados, "
        "mandar um e-mail de confirmação, processar um pagamento. Ele "
        "roda em um servidor, longe do usuário."
    ))
    elems.append(p(
        "O frontend conversa com o backend por meio de <b>requisições</b> "
        "(pede coisas) e <b>respostas</b> (recebe o resultado). É como "
        "um garçom: você (frontend) pede, a cozinha (backend) prepara, "
        "o garçom traz de volta."
    ))

    elems.append(h2("2.2 O que é um banco de dados"))
    elems.append(p(
        "Pense numa planilha do Excel, mas muito mais poderosa. O banco "
        "de dados guarda <b>tabelas</b> com linhas e colunas. No seu "
        "projeto, existe uma tabela de reservas, uma de disponibilidade, "
        "uma de clientes, e por aí vai. Quando alguém preenche o "
        "formulário de reserva, o backend escreve uma nova linha nessa "
        "tabela. Quando o admin abre a lista de reservas, o backend "
        "<b>lê</b> essas linhas."
    ))

    elems.append(h2("2.3 Server-side rendering (SSR)"))
    elems.append(p(
        "Antigamente, sites eram <i>arquivos HTML</i> estáticos. Hoje, "
        "muitos sites são <b>gerados na hora</b> pelo servidor. É o caso "
        "do seu: quando alguém acessa <i>/buffet/aniversario</i>, o "
        "servidor pega os dados do banco, monta a página com as fotos e "
        "preços atualizados, e manda pronta pro navegador. Isso é <b>SSR</b>, "
        "e é o padrão do Next.js que usamos."
    ))

    elems.append(h2("2.4 Por que um site precisa de tanta coisa?"))
    elems.append(p(
        "Você verá nas próximas páginas que o projeto usa várias "
        "bibliotecas. Isso não é frescura — cada uma resolve um problema "
        "que, sem ela, você teria que resolver na mão. Um exemplo: se "
        "você não usasse o <b>Zod</b> pra validar formulários, precisaria "
        "escrever manualmente centenas de <i>if/else</i> pra checar se o "
        "e-mail tem @, se o telefone tem 11 dígitos, etc. Multiplica isso "
        "por todas as partes do sistema e você entende por que a stack "
        "(conjunto de tecnologias) é grande."
    ))
    elems.append(PageBreak())
    return elems


# ----------------------------------------------------- 3. Tecnologias
def secao_3():
    elems = [h1("3. As tecnologias, uma por uma")]
    elems.append(p(
        "Todas as peças que compõem o seu projeto. Leia como se fosse um "
        "catálogo — cada uma cumpre um papel bem específico."
    ))

    elems.append(h2("3.1 Next.js 16"))
    elems.append(p(
        "É o <b>framework principal</b> do projeto. Pense num framework "
        "como um kit de ferramentas pré-montado: em vez de começar do "
        "zero, você ganha estrutura de pastas, roteamento (qual URL abre "
        "qual tela), renderização no servidor, otimização de imagens, e "
        "mais. O Next.js é construído em cima do React e é mantido pela "
        "Vercel."
    ))
    elems.append(callout(
        "A versão 16 é recente e introduziu várias mudanças em relação "
        "às anteriores. Por isso o arquivo AGENTS.md na raiz do projeto "
        "avisa: 'esta NÃO é a Next.js que você conhece'. Coisas como o "
        "arquivo <i>proxy.ts</i> (no lugar do antigo <i>middleware.ts</i>) "
        "e <i>params</i>/<i>searchParams</i> assíncronos são novidades."
    ))

    elems.append(h2("3.2 React"))
    elems.append(p(
        "É a biblioteca que desenha a tela. Em vez de manipular HTML na "
        "marra, você escreve <b>componentes</b> — pedacinhos reutilizáveis "
        "de interface, como um botão, um card de produto, um menu. O "
        "Next.js usa React por baixo dos panos."
    ))

    elems.append(h2("3.3 TypeScript"))
    elems.append(p(
        "Uma variação do JavaScript que obriga você a declarar o <b>tipo</b> "
        "de cada coisa: isto é um número, isto é um texto, isto é uma "
        "lista de reservas. Parece chato, mas é o que impede bugs bobos. "
        "Se você tentar somar um número com um texto, o TypeScript grita "
        "antes do código ir ao ar."
    ))

    elems.append(h2("3.4 Tailwind CSS v4"))
    elems.append(p(
        "É a biblioteca de estilos (cores, espaçamentos, fontes). Em vez "
        "de escrever CSS separado, você aplica <b>classes utilitárias</b> "
        "direto no HTML. Por exemplo: <i>bg-primary text-white px-4 py-2</i> "
        "vira um botão verde com texto branco e um pouco de padding."
    ))

    elems.append(h2("3.5 Supabase"))
    elems.append(p(
        "Um serviço pronto que entrega um <b>banco de dados</b> "
        "(Postgres), <b>autenticação</b> (cadastro e login de usuários) "
        "e <b>armazenamento de arquivos</b> (fotos, PDFs). É hospedado "
        "na nuvem — você não precisa gerenciar servidor de banco. No seu "
        "projeto, ele guarda reservas, clientes, datas bloqueadas, e "
        "autentica o administrador."
    ))

    elems.append(h2("3.6 Drizzle ORM"))
    elems.append(p(
        "Um <b>ORM</b> (Object-Relational Mapper) é um intérprete entre "
        "seu código TypeScript e o banco de dados. Em vez de escrever SQL "
        "na mão (<i>SELECT * FROM bookings WHERE ...</i>), você escreve "
        "em TypeScript (<i>db.select().from(bookings).where(...)</i>). "
        "O Drizzle traduz pra SQL no momento de rodar. Vantagem: o "
        "TypeScript confere se você está pedindo colunas que existem."
    ))

    elems.append(h2("3.7 Mercado Pago"))
    elems.append(p(
        "A plataforma de pagamento. Quando um cliente faz uma reserva, "
        "nosso backend cria uma <b>preferência de pagamento</b> no "
        "Mercado Pago e redireciona o cliente pra lá. Depois que ele "
        "paga, o Mercado Pago avisa nosso sistema por um <b>webhook</b> "
        "(uma 'chamada telefônica' automática entre sistemas)."
    ))

    elems.append(h2("3.8 Resend"))
    elems.append(p(
        "Serviço de envio de e-mails transacionais. É ele que manda a "
        "confirmação de reserva, o aviso de pagamento, os lembretes. "
        "Usamos porque enviar e-mail pela sua conta pessoal cairia em "
        "spam e teria limite baixo."
    ))

    elems.append(h2("3.9 Zod"))
    elems.append(p(
        "Uma biblioteca de <b>validação</b>. Você descreve o formato "
        "esperado (\"e-mail válido, telefone com 11 dígitos, data entre "
        "hoje e daqui a 1 ano\") e o Zod confere se os dados recebidos "
        "batem com essa descrição. Se não baterem, ele rejeita e explica "
        "qual campo está errado."
    ))

    elems.append(h2("3.10 date-fns"))
    elems.append(p(
        "Biblioteca pra manipular datas sem dor de cabeça. Soma dias, "
        "formata (\"15 de março de 2026\"), compara intervalos. Evita "
        "que você precise decorar as manhas do JavaScript padrão, que "
        "tem uma API de datas notoriamente estranha."
    ))
    elems.append(PageBreak())
    return elems


# ------------------------------------------------- 4. Estrutura de pastas
def secao_4():
    elems = [h1("4. A estrutura de pastas")]
    elems.append(p(
        "Um projeto Next.js tem algumas pastas com nomes e papéis "
        "convencionados. Aqui vai o mapa geral do Espaço Cruzeiro."
    ))

    elems.append(code(
        "espaco-cruzeiro/\n"
        "├── app/                  ← todas as páginas e rotas do site\n"
        "│   ├── (site)/           ← agrupamento das páginas públicas\n"
        "│   ├── admin/            ← painel administrativo\n"
        "│   ├── api/              ← endpoints (webhooks, etc)\n"
        "│   ├── layout.tsx        ← layout raiz (html, head, body)\n"
        "│   └── globals.css       ← estilos globais (Tailwind)\n"
        "├── components/           ← componentes reutilizáveis\n"
        "├── lib/                  ← código compartilhado (DB, auth, etc)\n"
        "│   ├── db/               ← Drizzle + schema\n"
        "│   ├── supabase/         ← clients Supabase\n"
        "│   ├── mercadopago/      ← integração com Mercado Pago\n"
        "│   └── email/            ← envio de e-mails via Resend\n"
        "├── public/               ← imagens e assets estáticos\n"
        "├── drizzle/              ← migrations do banco\n"
        "├── pdfs/                 ← (esta pasta) geradores de PDF\n"
        "├── proxy.ts              ← roda antes de cada requisição\n"
        "├── .env.local            ← suas chaves e senhas (NÃO commitar!)\n"
        "├── package.json          ← dependências do projeto\n"
        "├── tsconfig.json         ← configuração do TypeScript\n"
        "└── next.config.ts        ← configuração do Next.js"
    ))

    elems.append(h3("Por que tantas pastas?"))
    elems.append(p(
        "Separar por responsabilidade é uma regra de ouro da programação. "
        "Tudo relacionado a páginas vai em <i>app/</i>. Tudo relacionado "
        "a código utilitário (conexão com banco, envio de e-mail, "
        "autenticação) vai em <i>lib/</i>. Componentes visuais "
        "reutilizáveis vão em <i>components/</i>. Quando você bate o olho "
        "no arquivo, já sabe a categoria só pelo caminho."
    ))
    elems.append(PageBreak())
    return elems


# ---------------------------------------------------- 5. Tour por arquivos
def secao_5():
    elems = [h1("5. O que cada arquivo faz (tour guiado)")]
    elems.append(p(
        "Agora vamos entrar nos arquivos mais importantes. Não vou listar "
        "os 200+ arquivos do projeto — só os que importam pra entender o "
        "todo. Se quiser, tenha o projeto aberto ao lado enquanto lê."
    ))

    elems.append(h2("5.1 A pasta app/ — as páginas e rotas"))
    elems.append(p(
        "No Next.js 16, <b>cada pasta dentro de <i>app/</i> vira uma URL</b>. "
        "A pasta <i>app/buffet/aniversario/</i> vira a URL "
        "<i>seusite.com/buffet/aniversario</i>. Dentro de cada pasta, "
        "arquivos com nomes especiais têm funções específicas:"
    ))
    elems.append(two_col_table([
        ["page.tsx",
         "É a página em si. O que o usuário vê. Cada pasta precisa de um "
         "pra virar uma URL navegável."],
        ["layout.tsx",
         "É um 'molde' que envolve todas as páginas dentro da mesma pasta. "
         "Bom pra colocar cabeçalho, menu lateral, rodapé."],
        ["loading.tsx",
         "Aparece enquanto a página está carregando dados do servidor."],
        ["error.tsx",
         "Aparece se acontecer um erro na página."],
        ["route.ts",
         "Um endpoint de API (não é uma página visível). Usado em "
         "<i>app/api/*</i> pra receber webhooks, entre outras coisas."],
    ]))

    elems.append(h3("Exemplo real do projeto: app/admin/reservas/page.tsx"))
    elems.append(p(
        "Essa é a tela de listagem de reservas no painel admin. Ela "
        "busca no banco todas as reservas, separa por status, renderiza "
        "uma tabela, e mostra filtros. O código inteiro tem menos de 180 "
        "linhas, graças às abstrações do Drizzle e do React."
    ))
    elems.append(code(
        "export default async function BookingsListPage({ searchParams }) {\n"
        "  const { status, q } = await searchParams;\n"
        "  const db = getDb();\n"
        "  const rows = await db.select({ ... }).from(bookings);\n"
        "  return ( ...tabela em JSX... );\n"
        "}"
    ))
    elems.append(p(
        "Perceba o <b>async</b>. Ele diz: 'essa função vai esperar por "
        "coisas demoradas (o banco de dados)'. E o <b>await</b> marca "
        "onde ela espera. Esse é o jeito moderno do JavaScript lidar com "
        "operações assíncronas — assunto da seção 7."
    ))

    elems.append(h2("5.2 A pasta app/admin/ — o painel"))
    elems.append(p(
        "Tudo aqui só abre pra quem está logado como administrador. "
        "Existem páginas pra: dashboard com resumo, lista e detalhe de "
        "reservas, calendário visual, clientes, avaliações, cupons, "
        "bloqueios de data, e configurações. Cada uma mora na sua "
        "subpasta e tem um <i>page.tsx</i>."
    ))

    elems.append(h2("5.3 A pasta app/api/ — os endpoints"))
    elems.append(p(
        "São as 'portas de entrada' do backend que não são páginas. "
        "Por exemplo: <i>app/api/webhooks/mercadopago/route.ts</i> é o "
        "endereço que o Mercado Pago chama quando um pagamento muda de "
        "status. O arquivo exporta funções chamadas <i>POST</i>, <i>GET</i> "
        "etc, cada uma respondendo a um método HTTP."
    ))

    elems.append(h2("5.4 A pasta lib/ — o código utilitário"))
    elems.append(p(
        "O coração técnico. Nada aqui aparece direto pro usuário, mas "
        "tudo que está nas páginas depende dessas funções."
    ))
    elems.append(two_col_table([
        ["lib/db/index.ts",
         "Cria a conexão com o banco (Drizzle + postgres-js)."],
        ["lib/db/schema.ts",
         "Define as tabelas em TypeScript: <i>bookings</i>, <i>customers</i>, "
         "<i>blockedDates</i>, <i>coupons</i>, etc."],
        ["lib/supabase/server.ts",
         "Cria o cliente Supabase do lado do servidor. Também tem a "
         "função <i>isAdmin()</i> que confere se o usuário logado é admin."],
        ["lib/supabase/client.ts",
         "Cliente Supabase do lado do navegador (pra login, logout)."],
        ["lib/mercadopago/*",
         "Cria preferências de pagamento e lê notificações de webhook."],
        ["lib/email/*",
         "Templates e envio de e-mails via Resend."],
        ["lib/utils.ts",
         "Funções genéricas: formatar moeda (R$), datas, etc."],
        ["lib/zod/*",
         "Schemas de validação: o formato que cada formulário deve ter."],
    ]))

    elems.append(h2("5.5 A pasta components/"))
    elems.append(p(
        "Componentes reutilizáveis que aparecem em várias páginas: "
        "botões, cards, formulários, modal de confirmação. A ideia é: "
        "escreveu uma vez, usa cinquenta. Se um dia você mudar o estilo "
        "do botão, muda num lugar só."
    ))

    elems.append(h2("5.6 O arquivo proxy.ts"))
    elems.append(p(
        "Roda <b>antes</b> de cada requisição chegar na página. É onde "
        "verificamos se o usuário tem permissão pra acessar o "
        "<i>/admin/*</i>, por exemplo. No Next.js 16 esse arquivo chama "
        "<i>proxy.ts</i> (antes se chamava <i>middleware.ts</i>, e em "
        "muito material na internet você ainda verá o nome antigo — "
        "cuidado com desatualização)."
    ))

    elems.append(h2("5.7 O arquivo .env.local"))
    elems.append(p(
        "É um arquivo de <b>variáveis de ambiente</b>. Guarda as chaves "
        "sensíveis: senha do banco, token do Mercado Pago, chave da "
        "Supabase. Ele <b>nunca</b> deve ir pro Git (por isso existe no "
        "<i>.gitignore</i>). Cada ambiente (seu PC, produção) tem o seu."
    ))
    elems.append(callout(
        "Regra de ouro: se um valor é um segredo, ele mora em .env.local. "
        "Se alguém pegar esse arquivo, tem acesso ao seu banco e às suas "
        "integrações. Trate com o mesmo cuidado que senha do banco."
    ))

    elems.append(h2("5.8 O package.json"))
    elems.append(p(
        "A carteira de identidade do projeto: nome, versão, e a lista de "
        "<b>dependências</b> (as bibliotecas que o projeto usa). Quando "
        "alguém roda <i>npm install</i>, o npm lê esse arquivo e baixa "
        "tudo que falta na pasta <i>node_modules/</i>."
    ))
    elems.append(PageBreak())
    return elems


# ---------------------------------------------------- 6. Fluxos principais
def secao_6():
    elems = [h1("6. Os fluxos principais do sistema")]
    elems.append(p(
        "Até aqui vimos peças soltas. Agora juntamos. Um <b>fluxo</b> é "
        "a sequência de eventos que acontece quando alguém clica num "
        "botão ou acessa uma página."
    ))

    elems.append(h2("6.1 Fluxo de reserva (o mais importante)"))
    elems.append(bullet(
        "<b>1.</b> Cliente acessa o site e clica num tipo de evento "
        "(aniversário, casamento). O Next.js serve a página correspondente."))
    elems.append(bullet(
        "<b>2.</b> Cliente escolhe uma data no calendário. O calendário "
        "consulta <i>/api/availability</i> pra saber quais datas estão "
        "livres. Essa rota lê o banco (reservas + bloqueios) e responde "
        "com a lista de datas disponíveis."))
    elems.append(bullet(
        "<b>3.</b> Cliente preenche o formulário: nome, telefone, e-mail, "
        "convidados, extras (decoração, bebidas). O <b>Zod</b> valida no "
        "cliente <i>e</i> no servidor."))
    elems.append(bullet(
        "<b>4.</b> Ao enviar, o servidor cria a linha na tabela "
        "<i>bookings</i> com status <i>pending_payment</i> e gera um "
        "<b>código</b> único (ex: EC-2026-0042)."))
    elems.append(bullet(
        "<b>5.</b> O servidor pede ao Mercado Pago uma 'preferência de "
        "pagamento' e redireciona o cliente pro checkout deles."))
    elems.append(bullet(
        "<b>6.</b> Cliente paga. O Mercado Pago chama nosso webhook em "
        "<i>/api/webhooks/mercadopago</i>. O webhook confere que o "
        "pagamento é real, atualiza o status da reserva pra <i>confirmed</i> "
        "e dispara um e-mail de confirmação via Resend."))
    elems.append(bullet(
        "<b>7.</b> Cliente cai numa página de agradecimento. Dali a "
        "minutos, recebe o e-mail. Fim do fluxo."))

    elems.append(h2("6.2 Fluxo de login do admin"))
    elems.append(bullet(
        "<b>1.</b> Admin acessa <i>/admin/login</i> e digita e-mail e "
        "senha."))
    elems.append(bullet(
        "<b>2.</b> O Supabase confere as credenciais e, se baterem, "
        "devolve um <b>cookie</b> de sessão pro navegador."))
    elems.append(bullet(
        "<b>3.</b> Toda vez que o admin tenta abrir uma página <i>/admin/*</i>, "
        "o <i>proxy.ts</i> intercepta, confere o cookie, e verifica se o "
        "usuário tem a <i>role</i> \"admin\" no <i>app_metadata</i>."))
    elems.append(bullet(
        "<b>4.</b> Se sim, deixa passar. Se não, manda de volta pro login."))

    elems.append(h2("6.3 Fluxo de webhook (os pagamentos)"))
    elems.append(p(
        "Webhooks são chamadas que serviços externos fazem pro nosso "
        "servidor. O Mercado Pago chama <i>/api/webhooks/mercadopago</i> "
        "várias vezes pra um mesmo pagamento — às vezes o mesmo evento "
        "chega duas ou três vezes. Por isso implementamos "
        "<b>idempotência</b>: o webhook registra cada evento recebido "
        "numa tabela e, se o mesmo ID chegar de novo, ignora. Assim a "
        "mesma reserva nunca é confirmada em duplicata."
    ))
    elems.append(callout(
        "Idempotência = 'rodar de novo dá o mesmo resultado'. É um "
        "princípio essencial sempre que dois sistemas se falam pela "
        "internet, porque a rede falha e mensagens se repetem."
    ))
    elems.append(PageBreak())
    return elems


# ------------------------------------------ 7. Conceitos de programação
def secao_7():
    elems = [h1("7. Conceitos de programação que apareceram aqui")]
    elems.append(p(
        "Agora a parte mais instrutiva. Vou destrinchar conceitos que "
        "ficaram implícitos nos arquivos que vimos. Se você tirar uma "
        "coisa só dessa seção, já valeu o PDF."
    ))

    elems.append(h2("7.1 Síncrono vs assíncrono"))
    elems.append(p(
        "Algumas operações são <b>rápidas</b>: somar dois números, "
        "inverter um texto. O código espera o resultado e segue. Isso é "
        "<b>síncrono</b>. Outras são <b>demoradas</b> em escala de "
        "computador: buscar algo no banco (milissegundos) ou no Mercado "
        "Pago (segundos). Se o programa ficasse travado esperando, "
        "ninguém mais conseguiria usar o site. Por isso essas são "
        "<b>assíncronas</b>: o código dispara a operação, vai fazer "
        "outras coisas, e quando o resultado chega, continua."
    ))
    elems.append(p(
        "No TypeScript moderno usamos <b>async/await</b>. Uma função "
        "marcada como <i>async</i> pode usar <i>await</i> pra esperar "
        "um resultado assíncrono sem bloquear o resto."
    ))
    elems.append(code(
        "async function carregarReservas() {\n"
        "  const rows = await db.select().from(bookings);\n"
        "  return rows;\n"
        "}"
    ))

    elems.append(h2("7.2 Server Components vs Client Components"))
    elems.append(p(
        "No Next.js 16 (com React Server Components), os arquivos da "
        "pasta <i>app/</i> são, por padrão, <b>componentes de servidor</b>: "
        "rodam só no servidor, podem ler banco direto, <b>não</b> mandam "
        "nenhum JavaScript pro navegador. Quando você precisa de "
        "interação (cliques, campos controlados, animações), marca o "
        "arquivo com <i>\"use client\"</i> no topo, e ele vira "
        "<b>Client Component</b>."
    ))
    elems.append(callout(
        "Isso é diferente do que existia anos atrás e é uma das "
        "mudanças mais importantes do React recente. A ideia é: só "
        "mande JavaScript pro navegador quando realmente precisar. "
        "Páginas mais leves, site mais rápido."
    ))

    elems.append(h2("7.3 Tipos (TypeScript)"))
    elems.append(p(
        "Toda variável, parâmetro e retorno de função pode ser descrito "
        "com um <b>tipo</b>. Exemplo:"
    ))
    elems.append(code(
        "type Reserva = {\n"
        "  id: string;\n"
        "  nomeCliente: string;\n"
        "  dataEvento: Date;\n"
        "  convidados: number;\n"
        "  status: \"pending_payment\" | \"confirmed\" | \"cancelled\";\n"
        "};"
    ))
    elems.append(p(
        "O tipo <i>status</i> só aceita três valores — se você tentar "
        "colocar \"pago\", o compilador avisa. Esse rigor ajuda muito em "
        "projetos grandes."
    ))

    elems.append(h2("7.4 Validação de dados com Zod"))
    elems.append(p(
        "Todo dado que vem do mundo externo (formulário, URL, webhook) "
        "é suspeito. Nunca confie. O Zod é um 'porteiro':"
    ))
    elems.append(code(
        "const schema = z.object({\n"
        "  email: z.string().email(),\n"
        "  telefone: z.string().min(10),\n"
        "  dataEvento: z.coerce.date(),\n"
        "});\n"
        "\n"
        "const resultado = schema.safeParse(dadosDoFormulario);\n"
        "if (!resultado.success) { /* mostra erro */ }"
    ))

    elems.append(h2("7.5 ORM e o schema do banco"))
    elems.append(p(
        "Em <i>lib/db/schema.ts</i> descrevemos cada tabela em "
        "TypeScript. Isso vira, ao mesmo tempo, a fonte da verdade "
        "pro banco e o tipo que o TypeScript usa pra conferir suas "
        "consultas. Quando você precisa mudar o banco, altera o schema "
        "e roda uma <b>migration</b> (um script que diz ao banco: "
        "\"adicione essa coluna, remova aquela\")."
    ))

    elems.append(h2("7.6 Autenticação e RLS"))
    elems.append(p(
        "Autenticar é provar quem você é (login). Autorizar é definir o "
        "que você pode ver e fazer. O Supabase oferece <b>Row Level "
        "Security (RLS)</b>: regras direto no banco que dizem, linha por "
        "linha, quem pode ler ou gravar. Isso protege mesmo se alguém "
        "descobrir um bug no nosso código — o banco <i>também</i> "
        "bloqueia."
    ))

    elems.append(h2("7.7 Variáveis de ambiente e 12-factor"))
    elems.append(p(
        "Um dos 12 princípios (<b>12-factor app</b>) da boa arquitetura "
        "é: configuração fica fora do código. URL do banco, chaves de "
        "API, tudo em <i>.env</i>. Assim o mesmo código roda em dev, "
        "staging e produção só trocando variáveis."
    ))

    elems.append(h2("7.8 Git e versionamento"))
    elems.append(p(
        "Cada alteração fica registrada em <b>commits</b>. Você pode "
        "voltar no tempo, criar ramos paralelos (<b>branches</b>), "
        "mesclar mudanças. É a rede de segurança do programador. Mesmo "
        "projeto de uma pessoa só se beneficia: um erro hoje, você "
        "desfaz amanhã sem perder sono."
    ))
    elems.append(PageBreak())
    return elems


# ---------------------------------------------------- 8. Como evolui
def secao_8():
    elems = [h1("8. Como o projeto evolui daqui pra frente")]

    elems.append(h2("8.1 Pedindo mudanças"))
    elems.append(p(
        "Quando você quiser alterar algo (novo pacote, texto da capa, "
        "preço), me mande o pedido e eu altero. Alterações pequenas vão "
        "ao ar em minutos, basta refazer o <b>deploy</b> (um comando que "
        "manda a nova versão do código pro servidor)."
    ))

    elems.append(h2("8.2 Entendendo bugs"))
    elems.append(p(
        "Um bug é um comportamento inesperado. Pra descobrir a causa, "
        "o programador usa <b>logs</b> (mensagens registradas nos "
        "bastidores) e ferramentas do navegador. Todo <i>try/catch</i> "
        "que você vê no código é uma rede de segurança: se der ruim, a "
        "gente captura o erro e registra, em vez de deixar o site cair."
    ))

    elems.append(h2("8.3 Lendo documentação"))
    elems.append(p(
        "Saber programar é, em boa parte, saber procurar na documentação. "
        "Cada biblioteca que citei nesse documento tem um site com "
        "exemplos. Se quiser começar a aprender, sugiro a ordem:"
    ))
    elems.append(bullet("HTML e CSS (o básico de qualquer página)"))
    elems.append(bullet("JavaScript (a linguagem do navegador)"))
    elems.append(bullet("TypeScript (pra depois de dominar o JS)"))
    elems.append(bullet("React (componentes)"))
    elems.append(bullet("Next.js (o framework que une tudo)"))

    elems.append(h2("8.4 Recursos gratuitos"))
    elems.append(two_col_table([
        ["MDN Web Docs", "A referência oficial de HTML/CSS/JS."],
        ["javascript.info", "Curso gratuito, bem didático."],
        ["react.dev", "Documentação oficial do React."],
        ["nextjs.org/docs", "Guia do Next.js. Leia a versão 16!"],
        ["youtube.com/@WebDevSimplified", "Canal em inglês muito bom."],
        ["youtube.com/@CodandoComFrontend", "Canal BR de qualidade."],
        ["roadmap.sh", "Mapas visuais de aprendizado por área."],
    ]))
    elems.append(PageBreak())
    return elems


# ---------------------------------------------------- 9. Glossário
def secao_9():
    elems = [h1("9. Glossário rápido")]
    elems.append(p(
        "Termos que usamos nesse PDF (e que você vai ouvir no dia a dia "
        "de quem trabalha com web)."
    ))
    elems.append(two_col_table([
        ["API", "Interface que um sistema expõe pra outro conversar com ele."],
        ["Backend", "A parte do sistema que roda no servidor."],
        ["Branch", "Ramo paralelo de desenvolvimento no Git."],
        ["Cache", "Cópia temporária de dados pra responder mais rápido."],
        ["Cliente (client)", "Quem consome um serviço — normalmente o navegador."],
        ["Commit", "Um ponto salvo no histórico do código."],
        ["Cookie", "Pedacinho de dado que o servidor guarda no navegador do usuário."],
        ["CRUD", "Create, Read, Update, Delete — as 4 operações básicas em dados."],
        ["Deploy", "Ato de publicar uma nova versão do site no ar."],
        ["Endpoint", "Um endereço (URL) específico que responde a requisições."],
        ["Framework", "Kit pré-montado com estrutura e ferramentas (ex: Next.js)."],
        ["Frontend", "A parte do sistema que o usuário vê, no navegador."],
        ["Git", "Sistema de controle de versão."],
        ["Hosting", "Servidor que mantém o site no ar (ex: Vercel, Supabase)."],
        ["HTTP/HTTPS", "O protocolo que faz o navegador falar com o servidor."],
        ["JSON", "Formato leve de dados usado pra trocar informação entre sistemas."],
        ["Middleware/Proxy", "Código que roda antes de cada requisição."],
        ["Migration", "Script que altera a estrutura do banco de dados."],
        ["Postgres", "Banco de dados relacional open-source usado pelo Supabase."],
        ["React", "Biblioteca pra construir interfaces em componentes."],
        ["Role", "Papel de um usuário (ex: admin, cliente)."],
        ["Rota", "Uma URL atendida pelo sistema."],
        ["Servidor (server)", "Máquina que hospeda e executa o backend."],
        ["SQL", "Linguagem usada pra conversar com bancos relacionais."],
        ["Stack", "O conjunto de tecnologias usadas no projeto."],
        ["Token", "Cadeia de caracteres que prova identidade ou permissão."],
        ["Webhook", "Chamada automática que um sistema faz pra outro quando algo acontece."],
    ]))
    elems.append(spacer(1))
    elems.append(callout(
        "Se chegou até aqui: parabéns. Em pouco tempo você passou por "
        "conceitos que muita gente da área leva meses pra ver pela "
        "primeira vez. Use esse PDF como referência, volte quando "
        "precisar, e bom aprendizado."
    ))
    return elems


# --------------------------------------------------------------- build
def build():
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN + 0.3 * cm, bottomMargin=MARGIN,
        title="Documentação técnica — Espaço Cruzeiro",
        author="Matheus Martins",
    )

    story = []
    story += cover()
    story += toc()
    story += secao_1()
    story += secao_2()
    story += secao_3()
    story += secao_4()
    story += secao_5()
    story += secao_6()
    story += secao_7()
    story += secao_8()
    story += secao_9()

    doc.build(
        story,
        onFirstPage=make_cover_decorator(),
        onLaterPages=make_page_decorator("Documentação técnica"),
    )
    print(f"OK: {OUT}")


if __name__ == "__main__":
    build()
