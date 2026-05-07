"use client";

import { useTransition } from "react";

type ServerAction = (id: string) => Promise<{ ok: boolean }>;

export function RowDeleteButton({
  id,
  action,
  label = "Remover",
}: {
  id: string;
  action: ServerAction;
  label?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (!window.confirm("Tem certeza?")) return;
          await action(id);
        })
      }
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}
