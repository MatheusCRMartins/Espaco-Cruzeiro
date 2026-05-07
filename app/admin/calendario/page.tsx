import Link from "next/link";
import { and, gte, inArray, lt } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "Calendário" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ month?: string }>;

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function parseMonth(s: string | undefined) {
  const now = new Date();
  if (!s || !/^\d{4}-\d{2}$/.test(s)) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const [y, m] = s.split("-").map(Number);
  return { year: y, month: m };
}

function mm(n: number) {
  return String(n).padStart(2, "0");
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { year, month } = parseMonth(sp.month);
  const monthStr = `${year}-${mm(month)}`;
  const first = `${year}-${mm(month)}-01`;
  const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${mm(month + 1)}-01`;

  let bookings: Array<{
    id: string;
    code: string;
    date: string;
    start: string;
    customer: string;
    status: string;
    total: string;
  }> = [];
  let blocks: Array<{ date: string; reason: string | null }> = [];

  try {
    const db = getDb();
    const [bRows, blockRows] = await Promise.all([
      db
        .select({
          id: schema.bookings.id,
          code: schema.bookings.bookingCode,
          date: schema.bookings.eventDate,
          start: schema.bookings.eventStartTime,
          customer: schema.bookings.customerName,
          status: schema.bookings.status,
          total: schema.bookings.totalAmount,
        })
        .from(schema.bookings)
        .where(
          and(
            gte(schema.bookings.eventDate, first),
            lt(schema.bookings.eventDate, nextMonth),
            inArray(schema.bookings.status, [
              "pending_payment",
              "confirmed",
              "completed",
            ]),
          ),
        ),
      db
        .select({
          date: schema.blockedDates.date,
          reason: schema.blockedDates.reason,
        })
        .from(schema.blockedDates)
        .where(
          and(
            gte(schema.blockedDates.date, first),
            lt(schema.blockedDates.date, nextMonth),
          ),
        ),
    ]);
    bookings = bRows;
    blocks = blockRows;
  } catch (err) {
    console.error("[admin/calendario] load failed:", err);
  }

  const bookingsByDate = new Map<string, typeof bookings>();
  for (const b of bookings) {
    const list = bookingsByDate.get(b.date) ?? [];
    list.push(b);
    bookingsByDate.set(b.date, list);
  }
  const blockByDate = new Map(blocks.map((b) => [b.date, b.reason]));

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const prev = month === 1 ? `${year - 1}-12` : `${year}-${mm(month - 1)}`;
  const next = month === 12 ? `${year + 1}-01` : `${year}-${mm(month + 1)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Calendário</h1>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={`/admin/calendario?month=${prev}`}
            className="rounded-md border border-border px-3 py-1 hover:bg-muted"
          >
            ←
          </Link>
          <span className="min-w-[180px] text-center font-medium capitalize">
            {MONTH_LABELS[month - 1]} de {year}
          </span>
          <Link
            href={`/admin/calendario?month=${next}`}
            className="rounded-md border border-border px-3 py-1 hover:bg-muted"
          >
            →
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border bg-muted/60 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-2">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[110px] border-b border-r border-border bg-muted/20" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const iso = `${year}-${mm(month)}-${mm(day)}`;
            const dayBookings = bookingsByDate.get(iso) ?? [];
            const isBlocked = blockByDate.has(iso);

            return (
              <div
                key={iso}
                className="min-h-[110px] border-b border-r border-border p-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{day}</span>
                  {isBlocked && (
                    <span
                      className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]"
                      title={blockByDate.get(iso) ?? ""}
                    >
                      bloq
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  {dayBookings.map((b) => (
                    <Link
                      key={b.id}
                      href={`/admin/reservas/${b.id}`}
                      className={`block rounded px-1.5 py-1 text-[11px] hover:opacity-90 ${
                        b.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-900"
                          : b.status === "pending_payment"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-sky-100 text-sky-900"
                      }`}
                      title={`${b.customer} — ${formatBRL(Number(b.total))}`}
                    >
                      <div className="font-medium">{b.start.slice(0, 5)} {b.customer.split(" ")[0]}</div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Mostrando reservas com status <strong>aguardando</strong>,{" "}
        <strong>confirmadas</strong> ou <strong>realizadas</strong> em {monthStr}.
      </p>
    </div>
  );
}
