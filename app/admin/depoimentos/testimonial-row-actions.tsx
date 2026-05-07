"use client";

import { useTransition } from "react";

import { deleteTestimonial, toggleTestimonial } from "./actions";

export function TestimonialRowActions({
  id,
  approved,
}: {
  id: string;
  approved: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-3 text-xs">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await toggleTestimonial(id, !approved);
          })
        }
        className="rounded border border-border px-2 py-1 hover:bg-muted"
      >
        {approved ? "Despublicar" : "Aprovar"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            if (!window.confirm("Remover depoimento?")) return;
            await deleteTestimonial(id);
          })
        }
        className="text-red-600 hover:underline"
      >
        Excluir
      </button>
    </div>
  );
}
