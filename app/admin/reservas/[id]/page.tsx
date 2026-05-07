import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { formatBRL } from "@/lib/utils";

import { BookingActionsPanel } from "./booking-actions";

export const dynamic = "force-dynamic";

type Params = { id: string };

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Aguardando pagamento",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Realizada",
  refunded: "Reembolsada",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const db = getDb();
  const [booking] = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, id));
  if (!booking) notFound();

  let eventTypeName = "—";
  if (booking.eventTypeId) {
    const [et] = await db
      .select({ name: schema.eventTypes.name })
      .from(schema.eventTypes)
      .where(eq(schema.eventTypes.id, booking.eventTypeId));
    if (et) eventTypeName = et.name;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/reservas"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Voltar
          </Link>
          <h1 className="mt-2 font-mono text-2xl font-semibold">{booking.bookingCode}</h1>
          <p className="text-sm text-muted-foreground">
            {STATUS_LABELS[booking.status] ?? booking.status}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <DetailBlock title="Cliente">
            <DetailRow label="Nome" value={booking.customerName} />
            <DetailRow label="E-mail" value={booking.customerEmail} />
            <DetailRow label="Telefone" value={booking.customerPhone} />
            <DetailRow label="CPF" value={booking.customerCpf ?? "—"} />
          </DetailBlock>

          <DetailBlock title="Evento">
            <DetailRow label="Tipo" value={eventTypeName} />
            <DetailRow label="Data" value={booking.eventDate} />
            <DetailRow
              label="Horário"
              value={`${booking.eventStartTime} – ${booking.eventEndTime}`}
            />
            <DetailRow label="Convidados" value={String(booking.guestsCount)} />
            <DetailRow
              label="Observações"
              value={booking.notes ?? "—"}
            />
          </DetailBlock>

          <DetailBlock title="Pagamento">
            <DetailRow
              label="Tipo"
              value={booking.paymentType === "deposit" ? "Sinal (30%)" : "Integral"}
            />
            <DetailRow label="Total" value={formatBRL(Number(booking.totalAmount))} />
            <DetailRow label="Sinal" value={formatBRL(Number(booking.depositAmount))} />
            <DetailRow label="ID pagamento" value={booking.paymentId ?? "—"} />
            <DetailRow label="Status pagamento" value={booking.paymentStatus ?? "—"} />
          </DetailBlock>

          <DetailBlock title="Auditoria">
            <DetailRow
              label="Criada em"
              value={booking.createdAt.toLocaleString("pt-BR")}
            />
            {booking.confirmedAt && (
              <DetailRow
                label="Confirmada em"
                value={booking.confirmedAt.toLocaleString("pt-BR")}
              />
            )}
            {booking.cancelledAt && (
              <DetailRow
                label="Cancelada em"
                value={booking.cancelledAt.toLocaleString("pt-BR")}
              />
            )}
            {booking.softLockExpiresAt && (
              <DetailRow
                label="Lock expira em"
                value={booking.softLockExpiresAt.toLocaleString("pt-BR")}
              />
            )}
          </DetailBlock>
        </div>

        <div className="space-y-4">
          <BookingActionsPanel
            bookingId={booking.id}
            currentNotes={booking.adminNotes}
            status={booking.status}
          />
        </div>
      </div>
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <h2 className="border-b border-border px-5 py-3 text-sm font-semibold">
        {title}
      </h2>
      <dl className="divide-y divide-border text-sm">{children}</dl>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
