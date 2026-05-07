"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { deleteTestimonial, toggleTestimonial } from "./actions";

export function TestimonialRowActions({
  id,
  approved,
}: {
  id: string;
  approved: boolean;
}) {
  const [pending, start] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 text-xs">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await toggleTestimonial(id, !approved);
            if (r.ok) {
              toast.success(approved ? "Despublicado." : "Publicado no site.");
            } else {
              toast.error("Não consegui atualizar.");
            }
          })
        }
        className="rounded border border-border px-2 py-1 hover:bg-muted"
      >
        {approved ? "Despublicar" : "Aprovar"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
        className="text-red-600 hover:underline"
      >
        Excluir
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Excluir depoimento?"
        description="O depoimento sai do site. Não dá pra desfazer."
        confirmLabel="Excluir"
        destructive
        onConfirm={async () => {
          const r = await deleteTestimonial(id);
          if (r.ok) toast.success("Depoimento excluído.");
          else toast.error("Não consegui excluir.");
        }}
      />
    </div>
  );
}
