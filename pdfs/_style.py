"""
Estilos compartilhados entre os 3 PDFs do Espaço Cruzeiro.
Paleta do projeto: verde #1d3a2c, dourado #d6b067, creme #f6f1e5.
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

# ------------------------------------------------------------------ cores
VERDE = colors.HexColor("#1d3a2c")
DOURADO = colors.HexColor("#d6b067")
CREME = colors.HexColor("#f6f1e5")
CINZA = colors.HexColor("#4b4b4b")
CINZA_CLARO = colors.HexColor("#e6e1d4")
FUNDO = colors.HexColor("#fafafa")

# ------------------------------------------------------------------ página
PAGE_SIZE = A4
MARGIN = 2 * cm

def build_styles():
    """Cria um StyleSheet com nossos estilos. Retorna o stylesheet."""
    styles = getSampleStyleSheet()

    # Capa
    styles.add(ParagraphStyle(
        name="CoverEyebrow",
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=DOURADO,
        leading=14,
        spaceAfter=8,
        alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name="CoverTitle",
        fontName="Helvetica-Bold",
        fontSize=32,
        textColor=VERDE,
        leading=38,
        spaceAfter=12,
        alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name="CoverSubtitle",
        fontName="Helvetica",
        fontSize=14,
        textColor=CINZA,
        leading=20,
        spaceAfter=24,
        alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name="CoverMeta",
        fontName="Helvetica",
        fontSize=10,
        textColor=CINZA,
        leading=14,
    ))

    # Conteúdo
    styles.add(ParagraphStyle(
        name="H1",
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=VERDE,
        leading=28,
        spaceBefore=18,
        spaceAfter=12,
        keepWithNext=True,
    ))
    styles.add(ParagraphStyle(
        name="H2",
        fontName="Helvetica-Bold",
        fontSize=15,
        textColor=VERDE,
        leading=20,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True,
    ))
    styles.add(ParagraphStyle(
        name="H3",
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=VERDE,
        leading=16,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True,
    ))
    styles.add(ParagraphStyle(
        name="Body",
        fontName="Helvetica",
        fontSize=10.5,
        textColor=CINZA,
        leading=16,
        spaceAfter=8,
        alignment=TA_JUSTIFY,
    ))
    styles.add(ParagraphStyle(
        name="MyBullet",
        fontName="Helvetica",
        fontSize=10.5,
        textColor=CINZA,
        leading=15,
        leftIndent=16,
        bulletIndent=4,
        spaceAfter=3,
    ))
    styles.add(ParagraphStyle(
        name="Small",
        fontName="Helvetica",
        fontSize=9,
        textColor=CINZA,
        leading=13,
    ))
    styles.add(ParagraphStyle(
        name="Callout",
        fontName="Helvetica",
        fontSize=10,
        textColor=VERDE,
        leading=15,
        leftIndent=12,
        rightIndent=12,
        spaceBefore=8,
        spaceAfter=8,
        backColor=CREME,
        borderColor=DOURADO,
        borderWidth=0,
        borderPadding=10,
    ))
    styles.add(ParagraphStyle(
        name="MyCode",
        fontName="Courier",
        fontSize=9,
        textColor=colors.black,
        leading=13,
        leftIndent=12,
        rightIndent=12,
        spaceBefore=6,
        spaceAfter=10,
        backColor=colors.HexColor("#f4f4f0"),
        borderColor=CINZA_CLARO,
        borderWidth=0.5,
        borderPadding=8,
    ))
    styles.add(ParagraphStyle(
        name="TOCItem",
        fontName="Helvetica",
        fontSize=11,
        textColor=VERDE,
        leading=18,
        leftIndent=0,
    ))
    return styles


# ------------------------------------------------------------ header/footer
def make_page_decorator(document_title: str):
    """
    Retorna uma função pra ser passada como onLaterPages do SimpleDocTemplate,
    renderizando cabeçalho discreto e número de página.
    """
    def draw(canvas, doc):
        canvas.saveState()
        # Header line
        canvas.setStrokeColor(CINZA_CLARO)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN, A4[1] - MARGIN + 0.4 * cm,
                    A4[0] - MARGIN, A4[1] - MARGIN + 0.4 * cm)
        # Header text
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(CINZA)
        canvas.drawString(MARGIN, A4[1] - MARGIN + 0.55 * cm, "Espaço Cruzeiro")
        canvas.drawRightString(A4[0] - MARGIN, A4[1] - MARGIN + 0.55 * cm,
                               document_title)
        # Footer page number
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(CINZA)
        canvas.drawRightString(A4[0] - MARGIN, MARGIN - 0.8 * cm,
                               f"{doc.page}")
        canvas.restoreState()
    return draw


def make_cover_decorator():
    """Decorator da capa (página 1): barra verde no topo + rodapé minimal."""
    def draw(canvas, doc):
        canvas.saveState()
        # Barra verde no topo
        canvas.setFillColor(VERDE)
        canvas.rect(0, A4[1] - 3 * cm, A4[0], 3 * cm, fill=1, stroke=0)
        # Faixa dourada fina
        canvas.setFillColor(DOURADO)
        canvas.rect(0, A4[1] - 3 * cm - 0.15 * cm, A4[0], 0.15 * cm,
                    fill=1, stroke=0)
        # Eyebrow na barra
        canvas.setFont("Helvetica-Bold", 10)
        canvas.setFillColor(DOURADO)
        canvas.drawString(MARGIN, A4[1] - 1.7 * cm, "ESPAÇO CRUZEIRO")
        canvas.setFont("Helvetica", 9)
        canvas.setFillColor(CREME)
        canvas.drawString(MARGIN, A4[1] - 2.15 * cm,
                          "Buffet e Eventos — Osasco/SP")
        canvas.restoreState()
    return draw
