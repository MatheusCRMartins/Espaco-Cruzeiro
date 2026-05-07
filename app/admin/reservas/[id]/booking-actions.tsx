"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/input";

import {
  cancelBookingAdmin,
  forceConfirmBooking,
  markBookingCompleted,
  updateAdminNotes,
} from "./actions";

export function BookingActionsPanel({
  bookingId,
  bookingCode,
  currentNotes,
  status,
}: {
  bookingId: string;
  bookingCode: string;
  currentNotes: string | null;
  status: string;
}) {
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const doAction = (
    action: () => Promise<{ ok: boolean; error?: string }>,
    success: string,
  ) => {
    start(async () => {
      setMsg(null);
      const r = await action();
      if (r.ok) toast.success(success);
      else toast.error(`Erro: ${r.error ?? "desconhecido"}`);
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
            onClick={() => setConfirmOpen(true)}
            disabled={pending}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Confirmar manualmente
          </button>
        )}
        {status === "confirmed" && (
          <button
            type="button"
            onClick={() => setCompleteOpen(true)}
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
              setCancelReason("");
              setCancelOpen(true);
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

      {/* Confirmar manualmente — só pede confirm padrão (não é destrutivo) */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Confirmar reserva ${bookingCode}?`}
        description="Marca o pagamento como aprovado manualmente. Use só quando o cliente já pagou por outro meio (transferência, dinheiro, etc.)."
        confirmLabel="Confirmar reserva"
        onConfirm={async () => {
          const r = await forceConfirmBooking(bookingId);
          if (r.ok) toast.success("Reserva confirmada.");
          else toast.error(`Erro: ${r.error ?? "desconhecido"}`);
          setMsg(r.ok ? "Reserva confirmada." : `Erro: ${r.error ?? "desconhecido"}`);
        }}
      />

      <ConfirmDialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        title="Marcar como realizada?"
        description="Use depois que o evento aconteceu. Reservas realizadas saem do calendário ativo."
        confirmLabel="Marcar realizada"
        onConfirm={async () => {
          const r = await markBookingCompleted(bookingId);
          if (r.ok) toast.success("Marcada como realizada.");
          else toast.error(`Erro: ${r.error ?? "desconhecido"}`);
          setMsg(r.ok ? "Marcada como realizada." : `Erro: ${r.error ?? "desconhecido"}`);
        }}
      />

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={`Cancelar reserva ${bookingCode}?`}
        description={
          <div className="space-y-2">
            <p>
              Isso libera a data e marca a reserva como cancelada. Se o cliente já
              pagou, lembre de processar o reembolso pelo Mercado Pago manualmente.
            </p>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Motivo do cancelamento (vai pro audit log)"
              className="text-foreground"
            />
          </div>
        }
        confirmPhrase="CANCELAR"
        confirmLabel="Cancelar reserva"
        destructive
        onConfirm={async () => {
          const r = await cancelBookingAdmin(
            bookingId,
            cancelReason.trim() || "(sem motivo informado)",
          );
          if (r.ok) toast.success("Reserva cancelada.");
          else toast.error(`Erro: ${r.error ?? "desconhecido"}`);
          setMsg(r.ok ? "Reserva cancelada." : `Erro: ${r.error ?? "desconhecido"}`);
        }}
      />
    </div>
  );
}
