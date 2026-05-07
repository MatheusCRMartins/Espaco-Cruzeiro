"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { deleteCoupon, toggleCoupon } from "./actions";

export function CouponRowActions({
  id,
  code,
  active,
}: {
  id: string;
  code: string;
  active: boolean;
}) {
  const [pending, start] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await toggleCoupon(id, !active);
            if (r.ok) toast.success(active ? "Cupom desativado." : "Cupom ativado.");
            else toast.error("Não consegui atualizar.");
          })
        }
        className="rounded border border-border px-2 py-1 hover:bg-muted disabled:opacity-50"
      >
        {active ? "Desativar" : "Ativar"}
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
        title={`Excluir cupom ${code}?`}
        description="Bookings que já usaram esse cupom mantêm o desconto histórico. Mas o código fica liberado pra reuso."
        confirmLabel="Excluir cupom"
        destructive
        onConfirm={async () => {
          const r = await deleteCoupon(id);
          if (r.ok) toast.success("Cupom excluído.");
          else toast.error("Não consegui excluir.");
        }}
      />
    </div>
  );
}
