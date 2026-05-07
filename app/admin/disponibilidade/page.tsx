import { asc, desc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

import {
  addBlockedDate,
  addRule,
  deleteBlockedDate,
  deleteRule,
} from "./actions";
import { RowDeleteButton } from "./row-delete-button";

export const metadata = { title: "Disponibilidade" };
export const dynamic = "force-dynamic";

const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export default async function AvailabilityAdminPage() {
  let rules: Array<{
    id: string;
    weekday: number;
    startTime: string;
    endTime: string;
    active: boolean;
  }> = [];
  let blocks: Array<{ id: string; date: string; reason: string | null }> = [];

  try {
    const db = getDb();
    const [r, b] = await Promise.all([
      db
        .select({
          id: schema.availabilityRules.id,
          weekday: schema.availabilityRules.weekday,
          startTime: schema.availabilityRules.startTime,
          endTime: schema.availabilityRules.endTime,
          active: schema.availabilityRules.active,
        })
        .from(schema.availabilityRules)
        .orderBy(asc(schema.availabilityRules.weekday)),
      db
        .select({
          id: schema.blockedDates.id,
          date: schema.blockedDates.date,
          reason: schema.blockedDates.reason,
        })
        .from(schema.blockedDates)
        .orderBy(desc(schema.blockedDates.date))
        .limit(50),
    ]);
    rules = r;
    blocks = b;
  } catch (err) {
    console.error("[admin/disponibilidade] load failed:", err);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Disponibilidade</h1>

      <section className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="font-semibold">Regras semanais</h2>
          <p className="text-sm text-muted-foreground">
            Dias da semana em que o espaço está disponível para receber eventos.
          </p>
        </div>

        <ul className="divide-y divide-border">
          {rules.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma regra cadastrada. Sem regras, todos os dias ficam indisponíveis no calendário público.
            </li>
          )}
          {rules.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <span className="font-medium">{WEEKDAY_LABELS[r.weekday]}</span>{" "}
                <span className="text-muted-foreground">
                  · {r.startTime.slice(0, 5)} até {r.endTime.slice(0, 5)}
                </span>
              </div>
              <RowDeleteButton id={r.id} action={deleteRule} />
            </li>
          ))}
        </ul>

        <form
          action={async (fd) => {
            "use server";
            await addRule(fd);
          }}
          className="grid gap-3 border-t border-border pt-4 sm:grid-cols-4"
        >
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Dia</span>
            <select
              name="weekday"
              required
              className="h-10 rounded-md border border-border bg-background px-2 text-sm"
            >
              {WEEKDAY_LABELS.map((l, i) => (
                <option key={i} value={i}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Início</span>
            <input
              name="startTime"
              type="time"
              required
              defaultValue="18:00"
              className="h-10 rounded-md border border-border bg-background px-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Fim</span>
            <input
              name="endTime"
              type="time"
              required
              defaultValue="23:00"
              className="h-10 rounded-md border border-border bg-background px-2 text-sm"
            />
          </label>
          <button className="h-10 self-end rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Adicionar regra
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="font-semibold">Datas bloqueadas</h2>
          <p className="text-sm text-muted-foreground">
            Feriados, manutenção ou qualquer data que não deve aparecer como disponível.
          </p>
        </div>

        <ul className="divide-y divide-border">
          {blocks.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma data bloqueada.
            </li>
          )}
          {blocks.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <span className="font-medium">{b.date}</span>
                {b.reason && (
                  <span className="text-muted-foreground"> · {b.reason}</span>
                )}
              </div>
              <RowDeleteButton id={b.id} action={deleteBlockedDate} label="Desbloquear" />
            </li>
          ))}
        </ul>

        <form
          action={async (fd) => {
            "use server";
            await addBlockedDate(fd);
          }}
          className="grid gap-3 border-t border-border pt-4 sm:grid-cols-[160px_1fr_auto]"
        >
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Data</span>
            <input
              name="date"
              type="date"
              required
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Motivo (opcional)</span>
            <input
              name="reason"
              placeholder="Ex.: feriado, manutenção…"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
          </label>
          <button className="h-10 self-end rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Bloquear
          </button>
        </form>
      </section>
    </div>
  );
}
