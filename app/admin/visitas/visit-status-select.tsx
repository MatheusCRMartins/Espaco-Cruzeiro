"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateVisitStatus } from "./actions";

const OPTIONS = [
  { value: "scheduled", label: "Agendada" },
  { value: "completed", label: "Realizada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "no_show", label: "Não compareceu" },
];

export function VisitStatusSelect({
  visitId,
  value,
}: {
  visitId: string;
  value: string;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "scheduled") return; // não permite voltar pra agendada
        start(async () => {
          const r = await updateVisitStatus(visitId, v);
          if (r.ok) toast.success("Status atualizado.");
          else toast.error("Não consegui atualizar.");
        });
      }}
      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
