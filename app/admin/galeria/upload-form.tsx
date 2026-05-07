"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  ADD_PHOTO_INITIAL,
  uploadGalleryPhoto,
  type AddPhotoState,
} from "./actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
}

export function UploadForm({
  eventTypes,
}: {
  eventTypes: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState<AddPhotoState, FormData>(
    uploadGalleryPhoto,
    ADD_PHOTO_INITIAL,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Reset preview + toast quando o servidor confirma resultado
  useEffect(() => {
    if (state.status === "ok") {
      toast.success(state.message ?? "Foto adicionada.");
      setPreviewUrl(null);
      setFileName(null);
      if (fileRef.current) fileRef.current.value = "";
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setPreviewUrl(null);
      setFileName(null);
      return;
    }
    setFileName(f.name);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }

  const fe = state.fieldErrors;

  return (
    <form
      action={formAction}
      className="rounded-lg border border-border bg-card p-5 space-y-4"
    >
      <div>
        <h2 className="font-semibold">Adicionar foto</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WebP ou AVIF. Até 10MB. Antes de subir, comprima a imagem
          (TinyPNG/Squoosh) — fotos menores carregam mais rápido pro visitante.
        </p>
      </div>

      <div>
        <Label htmlFor="file">Arquivo</Label>
        <input
          ref={fileRef}
          id="file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          onChange={handleFileChange}
          className={cn(
            "mt-1 block w-full rounded-md border border-input bg-background text-sm",
            "file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90",
          )}
        />
        <FieldError errors={fe?.["file"]} />
      </div>

      {previewUrl && (
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <p className="mb-2 text-xs text-muted-foreground">Pré-visualização:</p>
          {/* preview local — usar <img> simples evita config remoto */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={fileName ?? "Pré-visualização"}
            className="max-h-64 rounded-md object-contain"
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="altText">Texto alternativo (SEO + acessibilidade)</Label>
          <Input
            id="altText"
            name="altText"
            placeholder="Salão principal iluminado para a entrada dos noivos"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Descrição curta da cena. Vai pro alt da imagem — ajuda Google e leitores de tela.
          </p>
        </div>
        <div>
          <Label htmlFor="eventTypeId">Tipo de evento (opcional)</Label>
          <select
            id="eventTypeId"
            name="eventTypeId"
            className="mt-1 flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue=""
          >
            <option value="">— Geral —</option>
            {eventTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="displayOrder">Ordem (opcional)</Label>
          <Input
            id="displayOrder"
            name="displayOrder"
            type="number"
            defaultValue={0}
          />
        </div>
        <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" className="size-4" />
          ⭐ Destaque na home
        </label>
      </div>

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

      <Button type="submit" disabled={pending} className="gap-2">
        <Upload className="size-4" />
        {pending ? "Enviando…" : "Adicionar foto"}
      </Button>
    </form>
  );
}
