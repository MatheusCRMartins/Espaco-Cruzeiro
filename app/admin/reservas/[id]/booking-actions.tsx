"use client";

import { useState, useTransition } from "react";

import {
  cancelBookingAdmin,
  forceConfirmBooking,
  markBookingCompleted,
  updateAdminNotes,
} from "./actions";

export function BookingActionsPanel({
  bookingId,
  currentNotes,
  status,
}: {
  bookingId: string;
  currentNotes: string | null;
  status: string;
}) {
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const doAction = (action: () => Promise<{ ok: boolean; error?: string }>, success: string) => {
    start(async () => {
      setMsg(null);
      const r = await action();
      setMsg(r.ok ? success : `Erro: ${r.error ?? "desconhecido"}`);
    });
  };

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-5">
      <h3 className="font-semibold">Ações</h3>

      <div className="flex flex-wrap gap-2">
        {status !== "confirmed" && (
          <button
            type="button"
            onClick={() =>
              doAction(() => forceConfirmBooking(bookingId), "Reserva confirmada.")
            }
            disabled={pending}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Confirmar manualmente
          </button>
        )}
        {status === "confirmed" && (
          <button
            type="button"
            onClick={() =>
              doAction(() => markBookingCompleted(bookingId), "Marcada como realizada.")
            }
            disabled={pending}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            Marcar como realizada
          </button>
        )}
        {status !== "cancelled" && (
          <button
            type="button"
            onClick={() => {
              const reason = window.prompt("Motivo do cancelamento?") ?? "";
              if (!reason) return;
              doAction(
                () => cancelBookingAdmin(bookingId, reason),
                "Reserva cancelada.",
              );
            }}
            disabled={pending}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium">Notas internas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-border bg-background p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Visível apenas para o admin."
        />
        <button
          type="button"
          onClick={() =>
            doAction(() => updateAdminNotes(bookingId, notes), "Notas atualizadas.")
          }
          disabled={pending}
          className="mt-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
        >
          Salvar notas
        </button>
      </div>

      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
    </div>
  );
}
