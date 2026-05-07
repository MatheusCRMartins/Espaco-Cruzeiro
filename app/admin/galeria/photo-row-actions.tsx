"use client";

import { useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

import { deleteGalleryPhoto, toggleGalleryFeatured } from "./actions";

export function PhotoRowActions({
  id,
  initialFeatured,
}: {
  id: string;
  initialFeatured: boolean;
}) {
  const [featured, setFeatured] = useState(initialFeatured);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function onToggle() {
    start(async () => {
      const next = !featured;
      setFeatured(next); // optimistic
      setError(null);
      const r = await toggleGalleryFeatured(id, next);
      if (!r.ok) {
        setFeatured(!next);
        setError("Não consegui atualizar.");
        toast.error("Não consegui atualizar o destaque.");
      } else {
        toast.success(next ? "Marcada como destaque." : "Destaque removido.");
      }
    });
  }

  async function onConfirmDelete() {
    const r = await deleteGalleryPhoto(id);
    if (!r.ok) {
      setError(r.error ?? "Não consegui excluir.");
      toast.error(r.error ?? "Não consegui excluir.");
    } else {
      toast.success("Foto removida.");
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1 rounded px-2 py-1 transition disabled:opacity-50",
          featured
            ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
            : "border border-border text-muted-foreground hover:bg-muted",
        )}
        aria-pressed={featured}
        aria-label="Marcar como destaque"
      >
        <Star
          className={cn("size-3.5", featured && "fill-current")}
          aria-hidden
        />
        {featured ? "Destaque" : "Marcar destaque"}
      </button>
      <div className="flex items-center gap-2">
        {error && <span className="text-destructive">{error}</span>}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={pending}
          aria-label="Excluir"
          className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir esta foto?"
        description="A foto sai do site e do bucket. Não dá pra desfazer."
        confirmPhrase="EXCLUIR"
        confirmLabel="Excluir foto"
        destructive
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
