import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { isAdmin } from "@/lib/supabase/server";
import { getDb, schema } from "@/lib/db";
import { toCsv } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/export?type=bookings|leads
 *
 * Devolve um CSV com BOM UTF-8 (Excel BR friendly).
 * Apenas admin autenticado.
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "bookings";

  const db = getDb();

  if (type === "bookings") {
    const rows = await db
      .select({
        bookingCode: schema.bookings.bookingCode,
        status: schema.bookings.status,
        eventDate: schema.bookings.eventDate,
        eventStartTime: schema.bookings.eventStartTime,
        eventEndTime: schema.bookings.eventEndTime,
        customerName: schema.bookings.customerName,
        customerEmail: schema.bookings.customerEmail,
        customerPhone: schema.bookings.customerPhone,
        customerCpf: schema.bookings.customerCpf,
        guestsCount: schema.bookings.guestsCount,
        totalAmount: schema.bookings.totalAmount,
        depositAmount: schema.bookings.depositAmount,
        paymentType: schema.bookings.paymentType,
        paymentStatus: schema.bookings.paymentStatus,
        notes: schema.bookings.notes,
        adminNotes: schema.bookings.adminNotes,
        createdAt: schema.bookings.createdAt,
        confirmedAt: schema.bookings.confirmedAt,
        cancelledAt: schema.bookings.cancelledAt,
      })
      .from(schema.bookings)
      .orderBy(desc(schema.bookings.createdAt));

    const csv = toCsv(rows, [
      { key: "bookingCode", label: "Código" },
      { key: "status", label: "Status" },
      { key: "eventDate", label: "Data do evento" },
      { key: "eventStartTime", label: "Início" },
      { key: "eventEndTime", label: "Fim" },
      { key: "customerName", label: "Cliente" },
      { key: "customerEmail", label: "E-mail" },
      { key: "customerPhone", label: "Telefone" },
      { key: "customerCpf", label: "CPF" },
      { key: "guestsCount", label: "Convidados" },
      { key: "totalAmount", label: "Total (R$)" },
      { key: "depositAmount", label: "Sinal (R$)" },
      { key: "paymentType", label: "Tipo de pagamento" },
      { key: "paymentStatus", label: "Status do pagamento" },
      { key: "notes", label: "Observações cliente" },
      { key: "adminNotes", label: "Notas internas" },
      { key: "createdAt", label: "Criada em" },
      { key: "confirmedAt", label: "Confirmada em" },
      { key: "cancelledAt", label: "Cancelada em" },
    ]);

    const filename = `reservas-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (type === "leads") {
    const rows = await db
      .select({
        name: schema.leads.name,
        email: schema.leads.email,
        phone: schema.leads.phone,
        source: schema.leads.source,
        status: schema.leads.status,
        estimatedDate: schema.leads.estimatedDate,
        estimatedGuests: schema.leads.estimatedGuests,
        message: schema.leads.message,
        adminNotes: schema.leads.adminNotes,
        createdAt: schema.leads.createdAt,
        contactedAt: schema.leads.contactedAt,
      })
      .from(schema.leads)
      .orderBy(desc(schema.leads.createdAt));

    const csv = toCsv(rows, [
      { key: "name", label: "Nome" },
      { key: "email", label: "E-mail" },
      { key: "phone", label: "Telefone" },
      { key: "source", label: "Origem" },
      { key: "status", label: "Status" },
      { key: "estimatedDate", label: "Data estimada" },
      { key: "estimatedGuests", label: "Convidados estimados" },
      { key: "message", label: "Mensagem" },
      { key: "adminNotes", label: "Notas internas" },
      { key: "createdAt", label: "Recebido em" },
      { key: "contactedAt", label: "Contatado em" },
    ]);

    const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({ error: "invalid_type" }, { status: 400 });
}
