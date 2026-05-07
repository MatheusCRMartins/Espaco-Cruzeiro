# -*- coding: utf-8 -*-
"""Gera o PDF 2: Proposta comercial pro cliente."""
import os
from datetime import date
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
)
from reportlab.lib import colors

from _style import (
    build_styles, make_page_decorator, make_cover_decorator,
    PAGE_SIZE, MARGIN, VERDE, DOURADO, CREME, CINZA, CINZA_CLARO,
)

OUT = os.path.join(os.path.dirname(__file__), "02_proposta_comercial.pdf")

styles = build_styles()


def h1(t): return Paragraph(t, styles["H1"])
def h2(t): return Paragraph(t, styles["H2"])
def h3(t): return Paragraph(t, styles["H3"])
def p(t): return Paragraph(t, styles["Body"])
def b(t): return Paragraph(t, styles["MyBullet"], bulletText="•")
def small(t): return Paragraph(t, styles["Small"])
def call(t): return Paragraph(t, styles["Callout"])
def sp(h=0.3): return Spacer(1, h * cm)


# ------------------------------------------------------------------ capa
def cover():
    s = []
    s.append(Spacer(1, 5 * cm))
    s.append(Paragraph("PROPOSTA COMERCIAL", styles["CoverEyebrow"]))
    s.append(Paragraph("Site institucional e<br/>sistema de reservas",
                       styles["CoverTitle"]))
    s.append(Paragraph(
        "Projeto sob medida pra tirar as reservas do DM do Instagram "
        "e colocar o Espaço Cruzeiro num funil digital automatizado.",
        styles["CoverSubtitle"]))
    s.append(Spacer(1, 6 * cm))
    s.append(Paragraph(
        f"Documento 2 de 3<br/>"
        f"Preparado em: {date.today().strftime('%d/%m/%Y')}<br/>"
        f"Validade: 30 dias",
        styles["CoverMeta"]))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- contexto
def contexto():
    s = []
    s.append(h1("Contexto"))
    s.append(p(
        "Hoje o Espaço Cruzeiro capta reservas exclusivamente pelo Instagram, "
        "via mensagem direta. Esse modelo funciona mas tem gargalos caros:"))
    for item in [
        "<b>Lead perdido por demora de resposta</b> — casal que pergunta no domingo à noite e recebe resposta só na segunda à tarde já tá em outro buffet",
        "<b>Tempo do dono consumido em triagem</b> — 4 a 6 horas por semana respondendo “valor?”, “tem o dia X livre?”, “cabem Y pessoas?”",
        "<b>Falta de rastro</b> — reservas anotadas em caderno ou planilha, sem histórico, sem filtro por status, sem relatório",
        "<b>Impressão de amadorismo</b> — casamento é evento de R$ 30 mil a R$ 80 mil. Cliente premium espera processo mais sério do que DM de Instagram",
        "<b>Sem automação</b> — cada confirmação, lembrete e mudança depende de alguém digitando",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h1("O que a gente propõe"))
    s.append(p(
        "Um site institucional profissional integrado a um sistema próprio de "
        "reservas online com pagamento via Mercado Pago, notificações "
        "automáticas por e-mail e um painel de administração completo, "
        "tudo sob o domínio do Espaço Cruzeiro."))
    s.append(p(
        "O cliente descobre o buffet no Instagram, clica no link da bio, "
        "navega pelas páginas, vê fotos e depoimentos, escolhe a data direto "
        "num calendário que mostra o que tá disponível, preenche as "
        "informações e paga o sinal sem conversar com ninguém. Você recebe "
        "a reserva já confirmada no painel."))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- escopo
def escopo():
    s = []
    s.append(h1("Escopo detalhado"))
    s.append(p(
        "O projeto entrega três grandes áreas integradas, mais a infraestrutura "
        "que faz tudo rodar."))
    s.append(sp())

    s.append(h2("1 · Site público (7 páginas)"))
    for item in [
        "<b>Home</b> com hero visual, estatísticas do buffet, fotos em destaque, depoimentos e chamada principal pra reservar",
        "<b>Páginas por tipo de evento</b> (casamento, aniversário, corporativo, chá de bebê, revelação) — cada uma com descrição, fotos e preço",
        "<b>Sobre</b> — história do espaço, diferenciais, localização",
        "<b>Contato</b> com formulário integrado que vira lead no painel",
        "<b>FAQ</b> com perguntas frequentes",
        "<b>Políticas legais</b> — privacidade, termos de uso, cancelamento (LGPD)",
        "<b>SEO otimizado</b> — meta tags, sitemap, Open Graph (aquele card bonito no preview do WhatsApp/Instagram)",
        "Design responsivo — funciona bem do celular ao monitor grande",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("2 · Sistema de reservas"))
    for item in [
        "<b>Calendário ao vivo</b> mostrando apenas os dias disponíveis (não deixa o cliente escolher data já ocupada ou bloqueada)",
        "<b>Fluxo de 5 etapas</b> — tipo de evento, data, número de convidados, dados de contato, pagamento",
        "<b>Integração Mercado Pago</b> — aceita PIX, cartão de crédito e boleto",
        "<b>Sinal configurável</b> (hoje em 30%) — cliente paga só o sinal pra garantir a data",
        "<b>Trava de 15 min</b> — a data fica segura enquanto o cliente tá pagando; se não pagar, libera pra outros",
        "<b>E-mail automático de confirmação</b> quando o pagamento é aprovado",
        "<b>Lembretes automáticos</b> 7 dias e 1 dia antes do evento",
        "<b>Notificação pro dono</b> a cada nova reserva, nova lead e cada pagamento confirmado",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("3 · Painel administrativo (10 seções)"))
    for item in [
        "<b>Dashboard</b> com KPIs: reservas no mês, faturamento, leads, taxa de conversão",
        "<b>Reservas</b> — lista completa, filtros por status, detalhes de cada uma, confirmação manual, cancelamento",
        "<b>Calendário</b> mensal visual com todas as reservas e bloqueios",
        "<b>Leads</b> vindos do formulário de contato, com status (novo, em contato, qualificado, convertido, perdido)",
        "<b>Disponibilidade</b> — regras semanais (ex. só sábado e domingo) e datas bloqueadas específicas",
        "<b>Tipos de evento</b> — cadastro, preços, capacidade",
        "<b>Galeria</b> — upload de fotos e ordenação",
        "<b>Depoimentos</b> — moderação (aprova antes de aparecer no site)",
        "<b>Conteúdo</b> editável — textos da home, Sobre, FAQ sem mexer em código",
        "<b>Configurações</b> — estado das integrações",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("4 · Infraestrutura e qualidade"))
    for item in [
        "Hospedagem na Vercel com HTTPS automático",
        "Banco de dados Postgres no Supabase",
        "Autenticação com papéis (só admin acessa o painel)",
        "Registro de auditoria — toda ação no admin fica logada",
        "Webhook do Mercado Pago tolerante a falhas (não perde confirmação de pagamento)",
        "Validação de todos os formulários com proteção contra spam (honeypot)",
        "Conformidade LGPD — consent explícito, política de privacidade",
        "Cron job automático diário pra disparar os lembretes",
    ]:
        s.append(b(item))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- beneficios
def beneficios():
    s = []
    s.append(h1("Benefícios e retorno esperado"))
    s.append(p(
        "O projeto se paga rápido. Aqui vai uma estimativa conservadora "
        "baseada num buffet de porte médio:"))

    t = Table([
        ["Métrica", "Hoje", "Com o site"],
        ["Tempo respondendo DMs", "4–6h/semana", "0h (ou perto disso)"],
        ["Tempo até 1ª resposta ao lead", "horas ou dias", "instantâneo (site 24h)"],
        ["Lead que vira reserva", "~15% (estimativa)", "~30–40%"],
        ["Rastreabilidade de quem pediu orçamento", "memória / caderno", "painel com histórico"],
        ["Sinal recebido antes de bloquear data", "depende de combinar", "automático no ato"],
        ["Percepção do público", "informal", "profissional"],
    ], colWidths=[6 * cm, 5 * cm, 5 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), VERDE),
        ("TEXTCOLOR", (0, 0), (-1, 0), CREME),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TEXTCOLOR", (0, 1), (-1, -1), CINZA),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREME]),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    s.append(t)
    s.append(sp())

    s.append(call(
        "Conta conservadora: se o site evitar a perda de <b>1 casamento "
        "por ano</b> (ticket médio R$ 30 mil), o projeto já está pago "
        "várias vezes. Se aumentar a conversão em 5 pontos percentuais, "
        "vira uma máquina de vendas."))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- timeline
def timeline():
    s = []
    s.append(h1("Timeline"))
    s.append(p(
        "Cronograma de referência do início do projeto até o site no ar. "
        "Pode ser comprimido se o cliente responder rápido, ou alongado "
        "se faltar conteúdo."))
    rows = [
        ["Semana", "O que acontece"],
        ["1", "Cliente entrega conteúdo (fotos, textos, dados). Em paralelo, cria as contas nos serviços (Supabase, Mercado Pago, Resend, domínio)."],
        ["2", "Me passa as credenciais com segurança. Eu conecto tudo, cadastro conteúdo, subo preview numa URL provisória."],
        ["3", "Cliente testa preview ponta a ponta (site público + painel admin). Manda lista de ajustes. Eu ajusto e re-submeto."],
        ["4", "Cliente aprova. Faço deploy em produção no domínio oficial. Teste de compra real. Site no ar."],
        ["5–6", "Plantão intensivo: monitoro uso real e ajusto o que aparecer. Treinamento do cliente pro dia a dia."],
    ]
    t = Table(rows, colWidths=[2.5 * cm, 13.5 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), VERDE),
        ("TEXTCOLOR", (0, 0), (-1, 0), CREME),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("TEXTCOLOR", (0, 1), (-1, -1), CINZA),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREME]),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    s.append(t)
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- investimento
def investimento():
    s = []
    s.append(h1("Investimento"))
    s.append(p(
        "Valor total do projeto: <b>R$ 18.000,00</b>, dividido em 3 parcelas "
        "de acordo com a entrega. Isso cobre todo o desenvolvimento, "
        "configuração das integrações, publicação em produção e 2 semanas "
        "de plantão pós go-live."))
    s.append(sp())

    s.append(h2("Forma de pagamento"))
    rows = [
        ["Parcela", "%", "Valor", "Quando"],
        ["1", "40%", "R$ 7.200", "Na assinatura do contrato — libera o início dos trabalhos"],
        ["2", "30%", "R$ 5.400", "Na aprovação do preview (Etapa 4) — libera o deploy em produção"],
        ["3", "30%", "R$ 5.400", "Na entrega em produção com teste de compra real validado"],
    ]
    t = Table(rows, colWidths=[1.5 * cm, 1.5 * cm, 2.5 * cm, 10.5 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), VERDE),
        ("TEXTCOLOR", (0, 0), (-1, 0), CREME),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTNAME", (2, 1), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (2, -1), "CENTER"),
        ("TEXTCOLOR", (0, 1), (-1, -1), CINZA),
        ("TEXTCOLOR", (2, 1), (2, -1), VERDE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREME]),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
    ]))
    s.append(t)
    s.append(sp(0.5))
    s.append(small(
        "Pagamento via PIX ou transferência. Nota fiscal emitida em CNPJ da "
        "empresa contratada na entrega de cada parcela."))
    s.append(PageBreak())

    s.append(h1("Manutenção mensal (opcional, recomendado)"))
    s.append(p(
        "Depois que o site entra no ar, ele precisa de cuidado contínuo: "
        "monitoramento, backups, atualizações de segurança, pequenos "
        "ajustes de conteúdo, correção de bugs que aparecem com uso real."))
    s.append(p(
        "A mensalidade cobre isso e te dá um canal direto pra qualquer "
        "demanda do dia a dia. Sem mensalidade, ajustes são cotados à parte "
        "e entram na fila."))
    s.append(sp())

    rows = [
        ["Plano", "Mensalidade", "O que inclui"],
        ["Básico", "R$ 500",
         "Hospedagem + monitoramento + backups + até 2h/mês de ajustes "
         "pequenos (trocar texto, adicionar foto, ajustar preço)"],
        ["Plus", "R$ 900",
         "Tudo do Básico + 5h/mês de melhorias (nova funcionalidade "
         "pequena, relatório sob medida) + prioridade no suporte"],
        ["Dedicado", "R$ 1.500",
         "Tudo do Plus + SLA de 4h úteis pra resposta + acompanhamento "
         "mensal por vídeo pra revisão de resultados"],
    ]
    t = Table(rows, colWidths=[3 * cm, 3 * cm, 10 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), VERDE),
        ("TEXTCOLOR", (0, 0), (-1, 0), CREME),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 1), (1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TEXTCOLOR", (0, 1), (-1, -1), CINZA),
        ("TEXTCOLOR", (1, 1), (1, -1), VERDE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREME]),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    s.append(t)
    s.append(sp(0.5))
    s.append(small(
        "A primeira mensalidade começa no mês seguinte ao go-live. Pode "
        "cancelar a qualquer momento com 30 dias de aviso."))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- escopo fora
def fora_escopo():
    s = []
    s.append(h1("O que NÃO está incluso"))
    s.append(p(
        "Pra evitar expectativa errada, listo abaixo o que eu <b>não</b> entrego "
        "nesta proposta. Qualquer um desses itens pode ser contratado à parte."))
    for item in [
        "<b>Fotografia profissional</b> do espaço — as fotos usadas são as que o cliente fornece. Se precisar de ensaio profissional, indicamos fotógrafos parceiros.",
        "<b>Redação publicitária (copywriter)</b> — eu polo textos que o cliente me fornece, mas não crio campanha publicitária nem copy de vendas do zero.",
        "<b>Design gráfico além do site</b> — logo, cartão de visita, material impresso. Se precisar, cotamos à parte.",
        "<b>Anúncios pagos</b> (Google Ads, Meta Ads) — o site fica pronto pra receber tráfego, mas gerar tráfego é outro serviço.",
        "<b>Integração com sistemas de terceiros</b> além dos listados (ex. Omie, Conta Azul, outros ERPs). Se precisar, cotamos.",
        "<b>Aplicativo nativo</b> (iOS/Android) — o site é responsivo e funciona excelente no celular, mas não vira app na loja.",
        "<b>Emissão automática de notas fiscais</b> — o pagamento cai no Mercado Pago; o cliente emite a NF pelo sistema dele (ou integração separada).",
        "<b>WhatsApp API oficial</b> — hoje o site integra com WhatsApp via link. A API oficial da Meta é outro processo de cadastro (contrato separado, regra da Meta).",
        "<b>Retoque infinito de layout</b> — aceitamos 2 rodadas de ajustes visuais. Depois disso, ajustes entram na mensalidade ou são cotados.",
    ]:
        s.append(b(item))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- termos
def termos():
    s = []
    s.append(h1("Termos comerciais"))

    s.append(h2("Propriedade do código"))
    s.append(p(
        "O código fonte do projeto fica sob minha propriedade intelectual "
        "(framework genérico). O cliente recebe <b>licença de uso "
        "perpétua e exclusiva</b> pra operação do Espaço Cruzeiro, incluindo "
        "todas as customizações feitas. Isso significa: o site é do cliente pra "
        "sempre, ninguém pode tirar do ar, mas o framework base pode ser "
        "reutilizado em outros projetos meus com outras customizações."))
    s.append(h2("Dados do cliente"))
    s.append(p(
        "Todos os dados (reservas, leads, fotos, textos) são <b>100% do "
        "cliente</b>. Ficam hospedados nas contas do próprio cliente "
        "(Supabase, Vercel, Mercado Pago, Resend). A qualquer momento "
        "ele pode exportar tudo ou migrar pra outro prestador."))
    s.append(h2("Custos recorrentes que ficam com o cliente"))
    for item in [
        "Domínio (~R$ 40/ano no registro.br)",
        "Supabase — plano gratuito suficiente pra começar; se crescer muito, ~US$ 25/mês",
        "Vercel — plano gratuito suficiente; se crescer muito, ~US$ 20/mês",
        "Resend — gratuito até 3.000 e-mails/mês",
        "Mercado Pago — cobra taxa por transação, sem mensalidade",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("Prazo"))
    s.append(p(
        "4 a 6 semanas a partir do recebimento do conteúdo inicial e das "
        "credenciais. Atrasos do lado do cliente (em entregar conteúdo ou "
        "acessos) empurram proporcionalmente."))

    s.append(h2("Garantia"))
    s.append(p(
        "Durante 30 dias após o go-live, qualquer bug encontrado é "
        "corrigido sem custo. Nova funcionalidade não se enquadra nessa "
        "garantia (é objeto de cotação à parte)."))

    s.append(h2("Validade desta proposta"))
    s.append(p("30 dias a partir da data de emissão deste documento."))
    s.append(PageBreak())

    s.append(h1("Próximos passos"))
    s.append(p("Pra começar, preciso apenas de:"))
    for item in [
        "Sua confirmação por escrito aceitando esta proposta",
        "Assinatura do contrato (mando em PDF pra assinatura digital)",
        "Pagamento da primeira parcela (40%)",
    ]:
        s.append(b(item))
    s.append(sp())
    s.append(p(
        "Após isso, te envio o Guia Passo a Passo (Documento 1) pra você "
        "começar a juntar conteúdo. A partir daí seguimos o cronograma da "
        "Timeline."))
    s.append(sp())
    s.append(call(
        "Qualquer dúvida sobre escopo, prazo, valor ou forma de pagamento, "
        "me chama no WhatsApp pra conversar. Estou aberto a ajustar o "
        "formato pra encaixar no seu momento."))
    s.append(sp(1.0))
    s.append(p("_________________________________________"))
    s.append(p("Assinatura do cliente"))
    s.append(sp(1.0))
    s.append(p("_________________________________________"))
    s.append(p("Assinatura do prestador"))
    return s


# ---------------------------------------------------------------- build
def build():
    doc = SimpleDocTemplate(
        OUT, pagesize=PAGE_SIZE,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN + 0.5 * cm, bottomMargin=MARGIN,
        title="Proposta comercial — Espaço Cruzeiro",
    )
    story = []
    story += cover()
    story += contexto()
    story += escopo()
    story += beneficios()
    story += timeline()
    story += investimento()
    story += fora_escopo()
    story += termos()

    doc.build(
        story,
        onFirstPage=make_cover_decorator(),
        onLaterPages=make_page_decorator("Proposta comercial"),
    )
    print(f"OK: {OUT}")


if __name__ == "__main__":
    build()
