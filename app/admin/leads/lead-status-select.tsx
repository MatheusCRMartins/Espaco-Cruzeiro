"use client";

import { useTransition } from "react";

import { updateLeadStatus } from "./actions";

const OPTIONS = [
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contato feito" },
  { value: "qualified", label: "Qualificado" },
  { value: "converted", label: "Convertido" },
  { value: "lost", label: "Perdido" },
];

export function LeadStatusSelect({
  leadId,
  value,
}: {
  leadId: string;
  value: string;
}) {
  const [pending, start] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => {
        const v = e.target.value;
        start(async () => {
          await updateLeadStatus(leadId, v);
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
