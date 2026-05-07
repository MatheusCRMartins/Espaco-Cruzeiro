/**
 * CSV serializer minimalista — sem dependência externa.
 *
 * - Aspas duplas em valores que contêm `,`, aspas, ou newline
 * - BOM UTF-8 no início pra Excel BR não corromper acentos
 * - LF unix (Excel aceita, Sheets aceita, Numbers aceita)
 */

const BOM = "﻿";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s: string;
  if (value instanceof Date) {
    s = value.toISOString();
  } else if (typeof value === "object") {
    s = JSON.stringify(value);
  } else {
    s = String(value);
  }
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: Array<{ key: keyof T & string; label: string }>,
): string {
  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((r) => columns.map((c) => escape(r[c.key])).join(","))
    .join("\n");
  return `${BOM}${header}\n${body}\n`;
}
