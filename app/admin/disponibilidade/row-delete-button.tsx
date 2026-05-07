"use client";

import { useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type ServerAction = (id: string) => Promise<{ ok: boolean }>;

export function RowDeleteButton({
  id,
  action,
  label = "Remover",
  title = "Remover este item?",
  description,
}: {
  id: string;
  action: ServerAction;
  label?: string;
  title?: string;
  description?: string;
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="text-xs text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "…" : label}
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        confirmLabel={label}
        destructive
        onConfirm={() =>
          new Promise<void>((resolve) => {
            start(async () => {
              await action(id);
              resolve();
            });
          })
        }
      />
    </>
  );
}
