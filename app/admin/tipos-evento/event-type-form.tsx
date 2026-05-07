"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  SAVE_EVENT_TYPE_INITIAL,
  saveEventType,
  type SaveEventTypeState,
} from "./actions";

export type EventTypeInitial = {
  id?: string;
  slug?: string;
  name?: string;
  description?: string | null;
  basePricePerPerson?: number | string;
  minGuests?: number;
  maxGuests?: number;
  durationHours?: number;
  displayOrder?: number;
  active?: boolean;
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
}

export function EventTypeForm({
  initial,
  mode,
}: {
  initial?: EventTypeInitial;
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState<SaveEventTypeState, FormData>(
    saveEventType,
    SAVE_EVENT_TYPE_INITIAL,
  );
  const fe = state.fieldErrors;
  const v = initial ?? {};

  useEffect(() => {
    if (state.status === "ok") toast.success(state.message ?? "Salvo.");
    else if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-border bg-card p-5">
      {v.id && <input type="hidden" name="id" value={v.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" defaultValue={v.name ?? ""} required maxLength={120} />
          <FieldError errors={fe?.["name"]} />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL) *</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={v.slug ?? ""}
            required
            placeholder="casamentos"
            pattern="[a-z0-9-]+"
            title="Apenas minúsculas, números e hífen"
          />
          <FieldError errors={fe?.["slug"]} />
          <p className="mt-1 text-xs text-muted-foreground">
            Usado em /eventos/[slug]. Apenas minúsculas, números e hífen.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição curta</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={v.description ?? ""}
          rows={3}
          placeholder="Como aparece no card e na página específica do evento."
          maxLength={2000}
        />
        <FieldError errors={fe?.["description"]} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="basePricePerPerson">Preço/pessoa (R$) *</Label>
          <Input
            id="basePricePerPerson"
            name="basePricePerPerson"
            type="number"
            step="0.01"
            min={0}
            defaultValue={v.basePricePerPerson?.toString() ?? ""}
            required
          />
          <FieldError errors={fe?.["basePricePerPerson"]} />
        </div>
        <div>
          <Label htmlFor="durationHours">Duração (horas) *</Label>
          <Input
            id="durationHours"
            name="durationHours"
            type="number"
            min={1}
            max={24}
            defaultValue={v.durationHours ?? 6}
            required
          />
          <FieldError errors={fe?.["durationHours"]} />
        </div>
        <div>
          <Label htmlFor="minGuests">Mín. convidados *</Label>
          <Input
            id="minGuests"
            name="minGuests"
            type="number"
            min={1}
            defaultValue={v.minGuests ?? 30}
            required
          />
          <FieldError errors={fe?.["minGuests"]} />
        </div>
        <div>
          <Label htmlFor="maxGuests">Máx. convidados *</Label>
          <Input
            id="maxGuests"
            name="maxGuests"
            type="number"
            min={1}
            max={2000}
            defaultValue={v.maxGuests ?? 150}
            required
          />
          <FieldError errors={fe?.["maxGuests"]} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={v.active ?? true}
            className="size-4"
          />
          Ativo (aparece no site público)
        </label>
        {mode === "edit" && (
          <input type="hidden" name="displayOrder" value={v.displayOrder ?? 0} />
        )}
        {mode === "create" && (
          <input type="hidden" name="displayOrder" value="0" />
        )}
      </div>

      {state.status === "error" && state.message && (
        <p
          className={cn(
            "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
          )}
          role="alert"
        >
          {state.message}
        </p>
      )}
      {state.status === "ok" && state.message && (
        <p className="text-sm text-emerald-700">✓ {state.message}</p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <Link
          href="/admin/tipos-evento"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </Link>
        <Button type="submit" disabled={pending} size="md">
          {pending ? "Salvando…" : mode === "edit" ? "Salvar alterações" : "Criar tipo"}
        </Button>
      </div>
    </form>
  );
}
