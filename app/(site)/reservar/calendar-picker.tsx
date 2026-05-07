"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type DayInfo = {
  date: string;
  weekday: number;
  status: "available" | "unavailable" | "blocked" | "booked";
  startTime?: string;
  endTime?: string;
};

type Props = {
  eventTypeId: string;
  value: string | null;
  onChange: (date: string, slot: { startTime: string; endTime: string }) => void;
};

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTH_LABELS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function firstOfMonthToday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function formatMonthParam(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CalendarPicker({ eventTypeId, value, onChange }: Props) {
  const [cursor, setCursor] = useState<Date>(firstOfMonthToday());
  const [days, setDays] = useState<DayInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const month = formatMonthParam(cursor);
    fetch(`/api/bookings/availability?eventTypeId=${eventTypeId}&month=${month}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: { days: DayInfo[] }) => {
        if (cancelled) return;
        setDays(json.days);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Não foi possível carregar a agenda. Tente novamente.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [cursor, eventTypeId]);

  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const today = todayIso();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, -1))}
          className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:bg-muted disabled:opacity-40"
          disabled={cursor <= firstOfMonthToday()}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="font-display text-base font-semibold capitalize">
          {MONTH_LABELS[cursor.getMonth()]} de {cursor.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="inline-flex size-9 items-center justify-center rounded-full border border-border hover:bg-muted"
          aria-label="Próximo mês"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((d) => {
          const isPast = d.date < today;
          const disabled = isPast || d.status !== "available";
          const selected = value === d.date;

          return (
            <button
              key={d.date}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (d.status !== "available" || !d.startTime || !d.endTime) return;
                onChange(d.date, { startTime: d.startTime, endTime: d.endTime });
              }}
              className={cn(
                "relative aspect-square rounded-xl border text-sm transition",
                disabled
                  ? "cursor-not-allowed border-transparent text-muted-foreground/40 line-through"
                  : "border-border hover:border-accent hover:bg-accent/10",
                selected && "border-accent bg-accent/15 font-semibold text-foreground",
                d.status === "booked" && "bg-muted/40",
                d.status === "blocked" && "bg-muted/40",
              )}
              aria-label={(() => {
                const dayNum = Number(d.date.split("-")[2]);
                const monthName = MONTH_LABELS[cursor.getMonth()];
                if (d.status === "available") {
                  return `${dayNum} de ${monthName}, disponível das ${d.startTime} às ${d.endTime}`;
                }
                if (d.status === "booked") return `${dayNum} de ${monthName}, já reservado`;
                if (d.status === "blocked")
                  return `${dayNum} de ${monthName}, data indisponível`;
                return `${dayNum} de ${monthName}, fora do expediente`;
              })()}
              title={
                d.status === "available"
                  ? `Disponível das ${d.startTime} às ${d.endTime}`
                  : d.status === "booked"
                    ? "Já reservado"
                    : d.status === "blocked"
                      ? "Data indisponível"
                      : "Fora do expediente"
              }
            >
              {Number(d.date.split("-")[2])}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent" /> disponível
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/50" /> indisponível
        </span>
        {loading && <span>carregando…</span>}
        {error && <span className="text-destructive">{error}</span>}
      </div>
    </div>
  );
}
