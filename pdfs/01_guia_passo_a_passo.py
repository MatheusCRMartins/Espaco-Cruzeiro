# -*- coding: utf-8 -*-
"""Gera o PDF 1: Guia passo a passo pro cliente leigo."""
import os
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether,
)
from reportlab.lib import colors

from _style import (
    build_styles, make_page_decorator, make_cover_decorator,
    PAGE_SIZE, MARGIN, VERDE, DOURADO, CREME, CINZA, CINZA_CLARO,
)

OUT = os.path.join(os.path.dirname(__file__), "01_guia_passo_a_passo.pdf")

styles = build_styles()


def h1(t): return Paragraph(t, styles["H1"])
def h2(t): return Paragraph(t, styles["H2"])
def h3(t): return Paragraph(t, styles["H3"])
def p(t): return Paragraph(t, styles["Body"])
def b(t): return Paragraph(t, styles["MyBullet"], bulletText="•")
def small(t): return Paragraph(t, styles["Small"])
def call(t): return Paragraph(t, styles["Callout"])
def sp(h=0.3): return Spacer(1, h * cm)


def info_table(rows):
    """Tabela de info tipo 'label | value' com duas colunas."""
    t = Table(rows, colWidths=[4 * cm, 12 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), VERDE),
        ("TEXTCOLOR", (1, 0), (1, -1), CINZA),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


# ------------------------------------------------------------------ capa
def cover():
    story = []
    # empurra o texto da capa pra baixo da barra verde
    story.append(Spacer(1, 5 * cm))
    story.append(Paragraph("GUIA PASSO A PASSO", styles["CoverEyebrow"]))
    story.append(Paragraph("Do briefing ao<br/>site no ar",
                           styles["CoverTitle"]))
    story.append(Paragraph(
        "O caminho completo pra tirar o site do papel — "
        "organizado em 7 etapas, explicadas pra quem não programa.",
        styles["CoverSubtitle"]))
    story.append(Spacer(1, 6 * cm))
    story.append(Paragraph(
        "Documento 1 de 3<br/>"
        "Site Espaço Cruzeiro<br/>"
        "Versão: rascunho de trabalho",
        styles["CoverMeta"]))
    story.append(PageBreak())
    return story


# ---------------------------------------------------------------- intro
def intro():
    s = []
    s.append(h1("Como usar este guia"))
    s.append(p(
        "Este documento descreve tudo o que precisa acontecer pra o site do "
        "Espaço Cruzeiro sair do ambiente de testes e entrar no ar com o "
        "domínio oficial. A sequência importa: pular etapas costuma gerar "
        "retrabalho."))
    s.append(p(
        "Cada etapa tem quatro blocos fixos pra facilitar o acompanhamento: "
        "o <b>objetivo</b> da fase, <b>o que você faz</b> (cliente/gestor), "
        "<b>o que eu faço</b> (parte técnica), <b>tempo estimado</b> e "
        "<b>custo envolvido</b>. Sempre que aparecer algo que eu preciso "
        "receber de você, tá destacado em bloco colorido."))
    s.append(sp())

    s.append(call(
        "<b>Princípio geral:</b> você cuida das decisões de negócio e dos "
        "acessos. Eu cuido de escrever o código, configurar integrações, "
        "publicar o site e corrigir o que aparecer. Sua função é revisar, "
        "aprovar, me mandar credenciais com segurança e testar."))
    s.append(sp())

    s.append(h2("Resumo das 7 etapas"))
    resumo = [
        ["1", "Reunir conteúdo", "1–3 dias", "zero"],
        ["2", "Criar contas nos serviços", "2–4 horas", "~R$ 40–60/ano (domínio)"],
        ["3", "Me passar os acessos", "15–30 min", "zero"],
        ["4", "Eu ligo tudo e você revisa", "2–4 dias", "zero"],
        ["5", "Deploy em produção", "1 dia", "zero"],
        ["6", "Testes finais com dinheiro real", "1–2 horas", "R$ 5–10 (reembolsável)"],
        ["7", "Site no ar", "contínuo", "zero"],
    ]
    t = Table([["#", "Etapa", "Tempo", "Custo"]] + resumo,
              colWidths=[1 * cm, 7 * cm, 3.5 * cm, 4.5 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), VERDE),
        ("TEXTCOLOR", (0, 0), (-1, 0), CREME),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TEXTCOLOR", (0, 1), (-1, -1), CINZA),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CREME]),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    s.append(t)
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- etapa 1
def etapa_1():
    s = []
    s.append(h1("Etapa 1 · Reunir o conteúdo do negócio"))
    s.append(info_table([
        ["Objetivo",
         "Juntar fotos, textos e dados reais do buffet. Sem isso o site fica com textos de exemplo."],
        ["Tempo", "1 a 3 dias — depende do que você já tem organizado."],
        ["Custo", "Zero."],
    ]))
    s.append(sp())

    s.append(h2("1.1 · Dados do negócio (texto)"))
    s.append(p(
        "Me manda num documento simples (Word, Google Docs ou WhatsApp) "
        "esses dados. Precisam estar corretos porque vão no contrato, nas "
        "notas fiscais que o site gera e no rodapé do site:"))
    for item in [
        "Razão social completa (nome jurídico)",
        "CNPJ",
        "Endereço completo (rua, número, bairro, CEP, cidade, estado)",
        "Telefone fixo (se tiver) e WhatsApp (obrigatório, com DDD)",
        "E-mail público (aparece no site) e e-mail do dono (pra avisos internos)",
        "Instagram (URL completo, ex. instagram.com/espacocruzeiro)",
        "Horário de funcionamento / atendimento",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("1.2 · Fotos do espaço"))
    s.append(p(
        "Este é o item mais importante pro site vender. Fotos ruins matam "
        "conversão. Siga o mínimo abaixo e, se puder, exagere:"))
    for item in [
        "No mínimo 10 a 15 fotos em boa qualidade (celular bom já serve)",
        "Variedade: salão vazio, salão decorado, mesa posta, fachada, área externa, banheiros, cozinha (se for item de venda)",
        "Fotos de evento real acontecendo são ouro — desde que tenha autorização dos retratados",
        "Não precisa redimensionar nem editar — me manda as originais",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("1.3 · Tipos de evento atendidos"))
    s.append(p(
        "Pra cada tipo (casamento, aniversário, corporativo, chá de bebê, "
        "chá revelação, etc.), me diz:"))
    for item in [
        "Nome (ex. “Casamento”)",
        "Descrição curta (2–3 linhas explicando o serviço)",
        "Preço por pessoa, ou “sob consulta”",
        "Mínimo e máximo de convidados",
        "Duração padrão em horas (ex. 6h)",
    ]:
        s.append(b(item))
    s.append(sp())
    s.append(call(
        "<b>Exemplo preenchido:</b> Casamento — Celebração completa com "
        "cerimônia e recepção no mesmo espaço. Equipe de cerimonial incluída. "
        "R$ 180 por pessoa. Mínimo 50, máximo 150 convidados. Duração 6h."))
    s.append(sp())

    s.append(h2("1.4 · Disponibilidade (quando você aceita eventos)"))
    for item in [
        "Dias da semana em que funciona (ex. sexta, sábado, domingo)",
        "Horário de cada dia (ex. sábado das 12h às 22h)",
        "Datas bloqueadas já conhecidas — feriados, manutenção, compromissos da família",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("1.5 · Textos do site"))
    s.append(p(
        "Não precisa escrever perfeito. Me manda em tópicos ou áudio "
        "transcrito; eu dou uma polida. Preciso de:"))
    for item in [
        "<b>Frase de impacto da home</b> — 1 linha (ex. “Eventos que você vai querer lembrar pra sempre”)",
        "<b>Sobre nós</b> — 1 parágrafo curto (história, tempo de mercado, diferencial)",
        "<b>FAQ</b> — 5 a 8 perguntas frequentes com resposta (“Como faço pra reservar?”, “Qual antecedência?”, “O que tá incluso no valor?”, “Posso trazer fornecedor externo?”)",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("1.6 · Depoimentos de clientes"))
    for item in [
        "De 3 a 5 depoimentos reais (prova social vende)",
        "De cada depoimento: nome do cliente, tipo de evento, data aproximada (mês/ano) e o texto",
        "Se conseguir autorização por escrito ou WhatsApp do cliente, melhor ainda",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("1.7 · Política de preços e pagamento"))
    for item in [
        "Aceita sinal pra reservar, ou só à vista?",
        "Quanto de sinal pra garantir a data? (hoje o sistema tá em 30% — dá pra mudar)",
        "Formas aceitas: PIX, cartão, boleto (todas entram via Mercado Pago)",
        "Prazo mínimo de antecedência pra reservar (ex. 30 dias antes)",
        "Política de cancelamento (quanto reembolsa se cancelar com X dias)",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(call(
        "<b>O que eu faço nesta etapa:</b> nada ainda. Aguardo você fechar "
        "o pacote dos 7 itens acima e me entregar. Enquanto isso posso ir "
        "preparando a estrutura de dados em paralelo com valores temporários."))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- etapa 2
def etapa_2():
    s = []
    s.append(h1("Etapa 2 · Criar as contas nos serviços"))
    s.append(info_table([
        ["Objetivo",
         "Cadastrar o negócio nos 4 serviços que o site usa. Eu não posso criar essas contas porque todas pedem CPF/CNPJ do dono."],
        ["Tempo", "2 a 4 horas no total, com algumas partes esperando aprovação."],
        ["Custo", "~R$ 40–60/ano (domínio). O resto tem plano grátis que já aguenta o começo."],
    ]))
    s.append(sp())

    s.append(h2("2.1 · Supabase — banco de dados e login"))
    s.append(p("Gratuito. Onde ficam todas as reservas, leads, fotos, textos e usuários admin."))
    for item in [
        "Abre <b>supabase.com</b> e clica em “Start your project”",
        "Entra com Google (mais simples) ou GitHub",
        "Clica <b>New project</b> e preenche:",
    ]:
        s.append(b(item))
    for item in [
        "<b>Name:</b> espaco-cruzeiro",
        "<b>Database password:</b> gere uma senha forte e anote num cofre (Bitwarden, 1Password). Vou precisar dela depois.",
        "<b>Region:</b> South America (São Paulo) — importante pra velocidade no Brasil",
        "<b>Pricing plan:</b> Free",
    ]:
        s.append(Paragraph("◦ " + item, styles["MyBullet"]))
    s.append(b("Clica “Create new project” e aguarda ~2 minutos"))
    s.append(b("Me avisa quando tiver criado — sem precisar mandar senhas ainda"))
    s.append(sp())

    s.append(h2("2.2 · Mercado Pago — pagamentos"))
    s.append(p(
        "Gratuito; cobra taxa apenas em cima das vendas (típico 4,99% + R$ 0,39 por transação, varia por método). "
        "<b>Pré-requisito:</b> CNPJ ativo. Você já confirmou que tem, então tá liberado."))
    for item in [
        "Abre <b>mercadopago.com.br</b>",
        "Clica “Criar conta” e escolhe <b>Sou empresa</b>",
        "Preenche cadastro com CNPJ, dados da empresa e conta bancária PJ",
        "A verificação do MP pode levar 1 a 3 dias úteis — é normal",
        "Quando aprovar, me avisa. Eu te guio pra gerar as credenciais do tipo certo.",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("2.3 · Resend — envio de e-mails"))
    s.append(p("Gratuito até 3.000 e-mails/mês. Muito mais do que o buffet vai usar por bastante tempo."))
    for item in [
        "Abre <b>resend.com</b> e cria conta (pode ser com Google)",
        "Vai em “Domains” e “Add domain”",
        "Esta parte depende do domínio — a gente completa depois da Etapa 2.4",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("2.4 · Domínio — endereço oficial do site"))
    s.append(p("~R$ 40/ano. Onde comprar: <b>registro.br</b> (o oficial brasileiro para .com.br)."))
    for item in [
        "Entra em <b>registro.br</b>",
        "Pesquisa <b>espacocruzeiro.com.br</b>",
        "Se disponível, registra (vai pedir CPF/CNPJ e pagamento do primeiro ano)",
        "Se já tiver dono, tenta variações: espacocruzeirobuffet.com.br, espacocruzeiroeventos.com.br",
        "Me avisa o domínio escolhido. Eu faço a configuração de DNS depois.",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("2.5 · Vercel — hospedagem do site"))
    s.append(p("Gratuito pra começar. É onde o site vai rodar 24h/dia."))
    for item in [
        "Abre <b>vercel.com</b>",
        "Cria conta com GitHub (se ainda não tem GitHub, cria em github.com — também gratuito)",
        "Me avisa o e-mail que usou",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(call(
        "<b>O que eu faço nesta etapa:</b> nada técnico ainda. Em paralelo "
        "com você cadastrando as contas, continuo preparando o código com "
        "dados de exemplo pra substituir pelos reais quando chegarem."))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- etapa 3
def etapa_3():
    s = []
    s.append(h1("Etapa 3 · Você me passa os acessos"))
    s.append(info_table([
        ["Objetivo", "Eu receber de forma segura as credenciais das contas criadas."],
        ["Tempo", "15 a 30 minutos."],
        ["Custo", "Zero."],
    ]))
    s.append(sp())

    s.append(call(
        "<b>Segurança em primeiro lugar.</b> Nunca me mande senha, chave ou "
        "token por chat aberto, e-mail comum ou foto pública. Use um cofre "
        "compartilhado (Bitwarden, 1Password, Proton Pass) ou serviço de "
        "mensagem efêmera como onetimesecret.com (link que se autodestrói "
        "após a leitura)."))
    s.append(sp())

    s.append(h2("3.1 · Do Supabase"))
    for item in [
        "URL do projeto (em <b>Settings → API</b>): começa com https://xxxxx.supabase.co",
        "<b>anon</b> public key (a mesma tela)",
        "<b>service_role</b> secret key — extremamente sensível, mande só por cofre",
        "<b>DATABASE_URL</b> (em <b>Settings → Database → Connection string → Transaction pooler</b>), com a senha que você anotou na Etapa 2.1",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("3.2 · Do Mercado Pago (após aprovação)"))
    for item in [
        "Access Token de produção",
        "Public Key de produção",
        "O webhook eu configuro com um segredo que eu gero",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("3.3 · Do Resend"))
    for item in [
        "API Key (só depois que o domínio for verificado — eu te guio nos registros DNS)",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("3.4 · Do registro.br"))
    for item in [
        "Login e senha do painel do domínio (pra eu configurar DNS)",
        "OU você me manda screenshots da tela de DNS e eu te dito o que colocar (mais seguro)",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("3.5 · Do GitHub e Vercel"))
    for item in [
        "E-mail da sua conta Vercel",
        "E-mail da sua conta GitHub",
        "Se quiser colaborar ativamente, me adiciona como Collaborator no repositório (eu te ensino)",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(call(
        "<b>O que eu faço nesta etapa:</b> recebo tudo, guardo com segurança "
        "e começo a conectar no código. Te aviso quando tiver tudo que preciso "
        "pra avançar."))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- etapa 4
def etapa_4():
    s = []
    s.append(h1("Etapa 4 · Eu ligo tudo e você revisa em preview"))
    s.append(info_table([
        ["Objetivo",
         "Site funcionando 100% numa URL provisória (só você e eu vemos), com os dados reais do buffet, antes de expor ao público."],
        ["Tempo",
         "2 a 4 dias — a maior parte é eu preenchendo dados e você revisando."],
        ["Custo", "Zero."],
    ]))
    s.append(sp())

    s.append(h2("O que eu faço"))
    for item in [
        "Conecto o Supabase e crio todas as tabelas do banco",
        "Cadastro seus tipos de evento, regras de disponibilidade, depoimentos, fotos e textos",
        "Subo uma URL de preview na Vercel, tipo espaco-cruzeiro-preview.vercel.app — só com o link acessa",
        "Configuro Mercado Pago em modo sandbox (simulação, sem dinheiro real)",
        "Configuro o Resend apontando pra domínio de teste",
        "Te mando: link de preview + login admin pra você testar",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("O que você faz"))
    s.append(h3("4.1 · Revisar o site público (1–2h)"))
    for item in [
        "Abre a URL no celular e no computador",
        "Passa por todas as páginas: Home, Eventos, Sobre, Contato, FAQ, Reservar",
        "Conferência: fotos certas, textos corretos, preços corretos",
        "Anota tudo que precisa mudar em um Google Docs ou lista simples",
    ]:
        s.append(b(item))
    s.append(h3("4.2 · Testar o fluxo de reserva (30 min)"))
    for item in [
        "Simula uma reserva do começo ao fim (tipo, data, convidados, contato, pagamento)",
        "No sandbox do MP, use o cartão de teste que eu te passo — paga sem cobrar",
        "Confirma que chegou e-mail de “reserva confirmada” na sua caixa",
        "Verifica se apareceu no painel admin",
    ]:
        s.append(b(item))
    s.append(h3("4.3 · Testar o painel admin (1h)"))
    for item in [
        "Eu te mando login de verdade (e-mail + senha do Supabase)",
        "Navega por tudo: Dashboard, Reservas, Leads, Calendário, Galeria, Depoimentos, Conteúdo",
        "Cadastra uma foto nova, aprova um depoimento, muda um texto",
        "Confirma que as mudanças aparecem no site público",
    ]:
        s.append(b(item))
    s.append(h3("4.4 · Me manda a lista de ajustes"))
    s.append(p(
        "Textos errados, fotos trocadas, preços diferentes, cores que "
        "achou estranhas. Eu faço os ajustes e te aviso quando estiver "
        "pronto pra revisar de novo. Esse ciclo se repete quantas vezes "
        "for necessário."))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- etapa 5
def etapa_5():
    s = []
    s.append(h1("Etapa 5 · Deploy em produção"))
    s.append(info_table([
        ["Objetivo", "Colocar o site no domínio oficial, com pagamentos reais."],
        ["Tempo", "1 dia de configuração + até 48h de propagação de DNS."],
        ["Custo", "Zero (só o domínio já pago na Etapa 2)."],
    ]))
    s.append(sp())

    s.append(h2("O que você faz"))
    for item in [
        "Me confirma por escrito: “tá aprovado, pode ir pro ar com o domínio oficial”",
        "Me passa (se ainda não tiver) as credenciais de produção do Mercado Pago — são diferentes do sandbox",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("O que eu faço"))
    for item in [
        "Troco todas as configurações de sandbox pra produção",
        "Aponto o DNS do domínio pra Vercel",
        "Configuro HTTPS/SSL (automático)",
        "Atualizo o webhook do Mercado Pago pra URL oficial",
        "Configuro o Resend pra domínio oficial",
        "Registro o cron diário que dispara lembretes D-7 e D-1",
        "Faço um teste de compra real (valor pequeno) — se passar, o site entra no ar",
    ]:
        s.append(b(item))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- etapa 6
def etapa_6():
    s = []
    s.append(h1("Etapa 6 · Testes finais com dinheiro real"))
    s.append(info_table([
        ["Objetivo", "Validar o fluxo completo em produção antes de divulgar."],
        ["Tempo", "1 a 2 horas."],
        ["Custo", "O valor do teste (sugiro R$ 5–10 — reembolsável em seguida)."],
    ]))
    s.append(sp())

    s.append(h2("O que você faz"))
    for item in [
        "Faz 1 reserva de teste usando seu próprio CPF e cartão/PIX",
        "Confirma que recebeu o e-mail de confirmação",
        "Confirma que o valor caiu na conta do Mercado Pago",
        "Confirma que a reserva apareceu no painel admin",
        "Se tudo OK, reembolsa o teste pelo painel do MP (te ensino como — leva 1 minuto)",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("O que eu faço"))
    for item in [
        "Fico em plantão enquanto você testa (podemos fazer vídeo chamada se quiser)",
        "Se algo der errado, corrijo na hora",
    ]:
        s.append(b(item))
    s.append(PageBreak())
    return s


# ---------------------------------------------------------------- etapa 7
def etapa_7():
    s = []
    s.append(h1("Etapa 7 · Site no ar e divulgando"))
    s.append(info_table([
        ["Objetivo", "Começar a receber reservas reais do público."],
        ["Tempo", "Contínuo, a partir daqui."],
        ["Custo", "Zero (hospedagem no plano grátis cobre o começo)."],
    ]))
    s.append(sp())

    s.append(h2("O que você faz"))
    for item in [
        "Atualiza a bio do Instagram com o link do site novo",
        "Posta anunciando “agora dá pra reservar pelo site”",
        "Deixa o link fixo nos stories/destaques",
        "Coloca na assinatura do WhatsApp Business",
        "Começa a mandar cliente novo pro site em vez de DM",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("O que eu faço"))
    for item in [
        "Fico 2 semanas de plantão intensivo — monitorando o comportamento em uso real",
        "Te ensino a operar o painel no dia a dia (posso gravar um vídeo de 15 min)",
        "Entrego manual escrito simples de uso",
    ]:
        s.append(b(item))
    s.append(sp())

    s.append(h2("Próxima ação imediata"))
    s.append(p(
        "Começa pela <b>Etapa 1.1</b> (dados do negócio) e <b>Etapa 1.2</b> "
        "(fotos). Pode ser por WhatsApp mesmo. Quando você me mandar isso, "
        "eu já começo a encaixar os dados reais enquanto você avança em "
        "paralelo nas Etapas 2 e 3."))
    s.append(sp())
    s.append(call(
        "Dica pra não travar: não espere ter tudo perfeito pra me mandar. "
        "Me manda o que tiver e vamos iterando. Site ir no ar com textos "
        "80% prontos e fotos boas é melhor do que ficar 6 meses esperando "
        "o 100% que nunca chega."))
    return s


# ---------------------------------------------------------------- build
def build():
    doc = SimpleDocTemplate(
        OUT, pagesize=PAGE_SIZE,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN + 0.5 * cm, bottomMargin=MARGIN,
        title="Guia passo a passo — Espaço Cruzeiro",
        author="Equipe do projeto",
    )
    story = []
    story += cover()
    story += intro()
    story += etapa_1()
    story += etapa_2()
    story += etapa_3()
    story += etapa_4()
    story += etapa_5()
    story += etapa_6()
    story += etapa_7()

    doc.build(
        story,
        onFirstPage=make_cover_decorator(),
        onLaterPages=make_page_decorator("Guia passo a passo"),
    )
    print(f"OK: {OUT}")


if __name__ == "__main__":
    build()
