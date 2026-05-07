"use client";

import { useActionState, useEffect, useState } from "react";
import { GripVertical, Plus, Trash2, ChevronDown, Save } from "lucide-react";

import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  SAVE_BLOCK_INITIAL,
  saveContentBlockAction,
  type SaveBlockState,
} from "./actions";

export type FieldDef =
  | { kind: "text"; label: string; placeholder?: string }
  | { kind: "textarea"; label: string; placeholder?: string; rows?: number }
  | { kind: "richtext"; label: string; placeholder?: string }
  | { kind: "list-strings"; label: string; itemLabel: string }
  | { kind: "list-faq"; label: string };

export type EntryDescriptor = {
  key: string;
  title: string;
  description: string;
  fields: Array<{ path: string; field: FieldDef }>;
};

type ObjectValue = Record<string, unknown>;
type FaqValue = Array<{ question: string; answer: string }>;

export function ContentBlockEditor({
  entry,
  initialValue,
}: {
  entry: EntryDescriptor;
  initialValue: unknown;
}) {
  const isFaq = entry.fields[0]?.field.kind === "list-faq";
  const [objectState, setObjectState] = useState<ObjectValue>(
    !isFaq && initialValue && typeof initialValue === "object"
      ? (initialValue as ObjectValue)
      : {},
  );
  const [faqState, setFaqState] = useState<FaqValue>(
    isFaq && Array.isArray(initialValue) ? (initialValue as FaqValue) : [],
  );

  const [state, formAction, pending] = useActionState<SaveBlockState, FormData>(
    saveContentBlockAction,
    SAVE_BLOCK_INITIAL,
  );

  // Reset feedback quando o estado salva com sucesso
  useEffect(() => {
    if (state.status === "ok") {
      const t = setTimeout(() => {
        // efeito visual: faz a mensagem sumir após 4s manualmente?
        // useActionState não tem reset; deixa lá até próximo submit.
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [state.status]);

  function updateObject(path: string, value: unknown) {
    setObjectState((prev) => ({ ...prev, [path]: value }));
  }

  function payload(): string {
    if (isFaq) return JSON.stringify(faqState);
    return JSON.stringify(objectState);
  }

  return (
    <details className="group rounded-lg border border-border bg-card open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 marker:hidden [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{entry.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{entry.description}</p>
        </div>
        <code className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
          {entry.key}
        </code>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <form action={formAction} className="space-y-4 border-t border-border p-5">
        <input type="hidden" name="key" value={entry.key} />
        <input type="hidden" name="payload" value={payload()} />

        {!isFaq &&
          entry.fields.map(({ path, field }) => (
            <FieldRender
              key={path}
              path={path}
              field={field}
              value={objectState[path]}
              onChange={(v) => updateObject(path, v)}
            />
          ))}

        {isFaq && <FaqEditor items={faqState} onChange={setFaqState} />}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="min-w-0 flex-1">
            {state.status === "error" && state.message && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {state.message}
              </p>
            )}
            {state.status === "ok" && state.message && (
              <p className="text-sm text-emerald-700">✓ {state.message}</p>
            )}
          </div>
          <Button type="submit" disabled={pending} size="sm" className="ml-3 gap-2">
            <Save className="size-4" />
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </form>
    </details>
  );
}

function FieldRender({
  field,
  path,
  value,
  onChange,
}: {
  field: FieldDef;
  path: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.kind === "text") {
    return (
      <div>
        <Label htmlFor={`f-${path}`}>{field.label}</Label>
        <Input
          id={`f-${path}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  }
  if (field.kind === "textarea") {
    return (
      <div>
        <Label htmlFor={`f-${path}`}>{field.label}</Label>
        <Textarea
          id={`f-${path}`}
          rows={field.rows ?? 3}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  }
  if (field.kind === "richtext") {
    return (
      <div>
        <Label>{field.label}</Label>
        <div className="mt-1">
          <RichTextEditor
            value={(value as string) ?? ""}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        </div>
      </div>
    );
  }
  if (field.kind === "list-strings") {
    const items = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div>
        <Label>{field.label}</Label>
        <ul className="mt-1 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  onChange(next);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const next = items.filter((_, idx) => idx !== i);
                  onChange(next);
                }}
                aria-label="Remover"
                className="rounded p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          <Plus className="size-3.5" />
          Adicionar {field.itemLabel}
        </button>
      </div>
    );
  }
  return null;
}

function FaqEditor({
  items,
  onChange,
}: {
  items: FaqValue;
  onChange: (v: FaqValue) => void;
}) {
  function update(idx: number, patch: Partial<FaqValue[number]>) {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  }
  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }
  function add() {
    onChange([
      ...items,
      { question: "Nova pergunta", answer: "<p>Resposta…</p>" },
    ]);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhuma pergunta cadastrada.
        </p>
      )}
      {items.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            "rounded-md border border-border bg-background p-3 space-y-2",
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-muted-foreground">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                aria-label="Subir"
                disabled={idx === 0}
                className="rounded px-1 hover:bg-muted disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                aria-label="Descer"
                disabled={idx === items.length - 1}
                className="rounded px-1 hover:bg-muted disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            <Input
              value={item.question}
              onChange={(e) => update(idx, { question: e.target.value })}
              placeholder="Pergunta"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              aria-label="Remover"
              className="rounded p-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <RichTextEditor
            value={item.answer}
            onChange={(html) => update(idx, { answer: html })}
            placeholder="Resposta…"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
      >
        <Plus className="size-4" />
        Adicionar pergunta
      </button>
    </div>
  );
}

// suppress unused import warning (icon kept for future drag-handle)
void GripVertical;
