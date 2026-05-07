"use client";

import { useActionState, useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  SCHEDULE_VISIT_INITIAL,
  scheduleVisit,
  type ScheduleVisitState,
} from "./actions";

type EventTypeOpt = { id: string; name: string };
type DaySlot = { date: string; weekday: number; slots: { time: string; available: boolean }[] };

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function fmtDayLabel(iso: string, weekday: number) {
  const [_y, m, d] = iso.split("-").map(Number);
  return `${WEEKDAY_LABELS[weekday]} ${d}/${MONTH_LABELS[m - 1]}`;
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
}

export function VisitForm({
  eventTypes,
  days,
}: {
  eventTypes: EventTypeOpt[];
  days: DaySlot[];
}) {
  const [state, formAction, pending] = useActionState<ScheduleVisitState, FormData>(
    scheduleVisit,
    SCHEDULE_VISIT_INITIAL,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const fe = state.fieldErrors;

  useEffect(() => {
    if (state.status === "ok") {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [state.status]);

  if (state.status === "ok") {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-8 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Calendar className="size-6" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-emerald-900">
          Visita agendada!
        </h2>
        <p className="mt-3 text-sm text-emerald-900">{state.message}</p>
      </div>
    );
  }

  const selectedDay = days.find((d) => d.date === selectedDate);

  return (
    <form action={formAction} className="space-y-6">
      {/* honeypot */}
      <div className="hidden" aria-hidden>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Step 1: data */}
      <section>
        <h2 className="font-display text-xl font-semibold">1. Escolha o dia</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visitas guiadas pelo espaço, com cerca de 1h.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {days.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sem agenda livre nos próximos 60 dias. Fale no WhatsApp pra
              encaixar fora do horário.
            </p>
          ) : (
            days.map((d) => {
              const active = selectedDate === d.date;
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(d.date);
                    setSelectedTime(null);
                  }}
                  className={cn(
                    "rounded-md border px-3 py-2 text-xs transition",
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-background hover:border-accent/60",
                  )}
                >
                  {fmtDayLabel(d.date, d.weekday)}
                </button>
              );
            })
          )}
        </div>
        <input type="hidden" name="scheduledDate" value={selectedDate ?? ""} />
      </section>

      {/* Step 2: horário */}
      {selectedDay && (
        <section>
          <h2 className="font-display text-xl font-semibold">2. Escolha o horário</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedDay.slots.map((s) => {
              const active = selectedTime === s.time;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setSelectedTime(s.time)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs transition",
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-background hover:border-accent/60",
                    !s.available && "cursor-not-allowed border-transparent text-muted-foreground/50 line-through hover:border-transparent",
                  )}
                >
                  <Clock className="size-3" aria-hidden />
                  {s.time}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="scheduledTime" value={selectedTime ?? ""} />
        </section>
      )}

      {/* Step 3: dados */}
      {selectedDate && selectedTime && (
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="font-display text-xl font-semibold">3. Seus dados</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerName">Nome completo *</Label>
              <Input id="customerName" name="customerName" required />
              <FieldError errors={fe?.["customerName"]} />
            </div>
            <div>
              <Label htmlFor="customerPhone">WhatsApp *</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                inputMode="tel"
                placeholder="(11) 99999-9999"
                required
              />
              <FieldError errors={fe?.["customerPhone"]} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="customerEmail">E-mail *</Label>
              <Input id="customerEmail" name="customerEmail" type="email" required />
              <FieldError errors={fe?.["customerEmail"]} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="eventTypeId">Tipo de evento (opcional)</Label>
              <select
                id="eventTypeId"
                name="eventTypeId"
                defaultValue=""
                className="mt-1 flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Ainda decidindo —</option>
                {eventTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Algo que devemos saber? (opcional)</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Ex.: vou levar acompanhante, tenho dúvida sobre cardápio…"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-1 size-4 rounded border-border text-primary"
            />
            <span>
              Aceito ser contatado pra confirmar a visita e receber lembretes.
            </span>
          </label>
          <FieldError errors={fe?.["consent"]} />

          {state.status === "error" && state.message && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {state.message}
            </p>
          )}

          <Button type="submit" disabled={pending} size="lg">
            {pending ? "Confirmando…" : "Confirmar visita"}
          </Button>
        </section>
      )}
    </form>
  );
}
