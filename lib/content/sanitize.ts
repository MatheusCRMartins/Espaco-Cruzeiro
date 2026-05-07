/**
 * HTML sanitizer minimalista — allowlist explícita de tags + atributos.
 *
 * Output do Tiptap (com starter-kit + link) já é seguro por construção,
 * mas aplicamos isso ANTES de salvar no banco como defesa em profundidade
 * — garante que ninguém consiga injetar um <script> ou onerror= mesmo
 * que algum dia troquemos de editor ou aceitemos paste de HTML externo.
 *
 * Não usa DOMParser pra rodar tanto em Server Action quanto em scripts.
 * Estratégia: regex strict. Pequeno mas suficiente pro nosso whitelist.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "code",
  "pre",
  "a",
]);

// Atributos por tag — tudo que não estiver aqui some
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
};

// URL schemes seguros pra <a href>
const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

/**
 * Sanitiza HTML pra uso em campos rich text.
 * Tags fora da allowlist são DESCARTADAS (mantém o texto interno).
 * Atributos não-permitidos são removidos.
 */
export function sanitizeRichText(html: string): string {
  if (!html) return "";

  // Remove comments primeiro
  let out = html.replace(/<!--[\s\S]*?-->/g, "");

  // Remove <script> e <style> com conteúdo (não dá pra simplesmente strip)
  out = out.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");

  // Tag-por-tag: ou mantém com atributos filtrados, ou converte pra texto
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (full, rawTag, rawAttrs) => {
    const tag = String(rawTag).toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return ""; // descarta a tag (texto interno fica)

    const isClosing = full.startsWith("</");
    if (isClosing) return `</${tag}>`;

    const allowed = ALLOWED_ATTRS[tag];
    if (!allowed || !allowed.size) return `<${tag}>`;

    // Parse atributos: name="value" ou name='value'
    const attrs: string[] = [];
    const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(rawAttrs)) !== null) {
      const attr = m[1].toLowerCase();
      if (!allowed.has(attr)) continue;
      const value = m[3] ?? m[4] ?? "";
      if (attr === "href" && !SAFE_URL.test(value.trim())) continue;
      const safeValue = value.replace(/"/g, "&quot;");
      attrs.push(`${attr}="${safeValue}"`);
    }

    if (tag === "a" && attrs.some((a) => a.startsWith("target="))) {
      // força rel pra evitar tabnabbing
      const hasRel = attrs.some((a) => a.startsWith("rel="));
      if (!hasRel) attrs.push('rel="noopener noreferrer"');
    }

    return `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}>`;
  });

  return out;
}
