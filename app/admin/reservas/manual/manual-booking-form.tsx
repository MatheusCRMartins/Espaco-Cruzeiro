"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Copy, ExternalLink, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { formatBRL } from "@/lib/utils";

import {
  MANUAL_BOOKING_INITIAL,
  createManualBooking,
  type ManualBookingState,
} from "./actions";

type EventTypeOpt = { id: string; name: string; basePricePerPerson: number };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
}

export function ManualBookingForm({ eventTypes }: { eventTypes: EventTypeOpt[] }) {
  const [state, formAction, pending] = useActionState<ManualBookingState, FormData>(
    createManualBooking,
    MANUAL_BOOKING_INITIAL,
  );
  const fe = state.fieldErrors;

  useEffect(() => {
    if (state.status === "ok") toast.success(state.message ?? "Link gerado.");
    else if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  if (state.status === "ok" && state.result) {
    const r = state.result;
    return (
      <div className="space-y-5 rounded-lg border border-emerald-300 bg-emerald-50 p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Reserva criada
          </p>
          <h2 className="mt-1 font-mono text-2xl font-semibold">{r.bookingCode}</h2>
          <p className="mt-1 text-sm text-emerald-900">
            Cliente paga {formatBRL(r.payableNow)} pelo link.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <Label>Link de pagamento</Label>
            <div className="mt-1 flex gap-2">
              <Input value={r.checkoutUrl} readOnly className="font-mono text-xs" />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(r.checkoutUrl);
                  toast.success("Link copiado.");
                }}
                className="rounded-md border border-border bg-background px-3 hover:bg-muted"
                aria-label="Copiar link"
              >
                <Copy className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={r.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#22c35e]"
            >
              <MessageCircle className="size-4" />
              Abrir WhatsApp
            </a>
            <a
              href={r.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
            >
              <ExternalLink className="size-4" />
              Abrir checkout
            </a>
            <Link
              href={`/admin/reservas/${r.bookingId}`}
              className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
            >
              Ver no painel
            </Link>
          </div>

          <p className="text-xs text-emerald-900">
            Lembrete: o link expira quando o pagamento é confirmado OU quando
            a soft-lock vence (60 min). Se o cliente não pagar a tempo, é só
            criar de novo.
          </p>
        </div>

        <Link
          href="/admin/reservas/manual"
          className="text-xs text-emerald-900 underline hover:text-emerald-700"
        >
          ← Criar outra reserva manual
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-border bg-card p-5">
      <div>
        <h2 className="font-semibold">Dados da reserva</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Cliente recebe o link e paga pelo Mercado Pago. A data é trancada por
          1h enquanto isso.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="eventTypeId">Tipo de evento *</Label>
          <select
            id="eventTypeId"
            name="eventTypeId"
            required
            className="mt-1 flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue=""
          >
            <option value="" disabled>
              Selecione…
            </option>
            {eventTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({formatBRL(t.basePricePerPerson)}/pessoa)
              </option>
            ))}
          </select>
          <FieldError errors={fe?.["eventTypeId"]} />
        </div>
        <div>
          <Label htmlFor="paymentType">Tipo de pagamento *</Label>
          <select
            id="paymentType"
            name="paymentType"
            defaultValue="deposit"
            className="mt-1 flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="deposit">Sinal (30%)</option>
            <option value="full">Integral</option>
          </select>
        </div>
        <div>
          <Label htmlFor="eventDate">Data *</Label>
          <Input id="eventDate" name="eventDate" type="date" required />
          <FieldError errors={fe?.["eventDate"]} />
        </div>
        <div>
          <Label htmlFor="eventStartTime">Início *</Label>
          <Input
            id="eventStartTime"
            name="eventStartTime"
            type="time"
            defaultValue="18:00"
            required
          />
          <FieldError errors={fe?.["eventStartTime"]} />
        </div>
        <div>
          <Label htmlFor="guestsCount">Convidados *</Label>
          <Input
            id="guestsCount"
            name="guestsCount"
            type="number"
            min={1}
            required
            defaultValue={50}
          />
          <FieldError errors={fe?.["guestsCount"]} />
        </div>
        <div>
          <Label htmlFor="couponCode">Cupom (opcional)</Label>
          <Input
            id="couponCode"
            name="couponCode"
            placeholder="EX: BLACK20"
            className="font-mono uppercase"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 font-semibold">Dados do cliente</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="customerName">Nome completo *</Label>
            <Input id="customerName" name="customerName" required />
            <FieldError errors={fe?.["customerName"]} />
          </div>
          <div>
            <Label htmlFor="customerCpf">CPF *</Label>
            <Input
              id="customerCpf"
              name="customerCpf"
              required
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
            <FieldError errors={fe?.["customerCpf"]} />
          </div>
          <div>
            <Label htmlFor="customerEmail">E-mail *</Label>
            <Input id="customerEmail" name="customerEmail" type="email" required />
            <FieldError errors={fe?.["customerEmail"]} />
          </div>
          <div>
            <Label htmlFor="customerPhone">WhatsApp *</Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              required
              placeholder="(11) 99999-9999"
              inputMode="tel"
            />
            <FieldError errors={fe?.["customerPhone"]} />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea id="notes" name="notes" rows={3} placeholder="Informações importantes da conversa…" />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <Link
          href="/admin/reservas"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </Link>
        <Button type="submit" disabled={pending} size="md">
          {pending ? "Gerando link…" : "Gerar link de pagamento"}
        </Button>
      </div>
    </form>
  );
}
