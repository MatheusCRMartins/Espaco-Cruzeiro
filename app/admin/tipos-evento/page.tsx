import Link from "next/link";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getDb, schema } from "@/lib/db";
import { cn } from "@/lib/utils";

import { EventTypesList, type EventTypeListItem } from "./event-types-list";

export const metadata = { title: "Tipos de evento" };
export const dynamic = "force-dynamic";

export default async function EventTypesAdminPage() {
  let items: EventTypeListItem[] = [];

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: schema.eventTypes.id,
        slug: schema.eventTypes.slug,
        name: schema.eventTypes.name,
        basePricePerPerson: schema.eventTypes.basePricePerPerson,
        minGuests: schema.eventTypes.minGuests,
        maxGuests: schema.eventTypes.maxGuests,
        durationHours: schema.eventTypes.durationHours,
        displayOrder: schema.eventTypes.displayOrder,
        active: schema.eventTypes.active,
      })
      .from(schema.eventTypes)
      .orderBy(asc(schema.eventTypes.displayOrder));
    items = rows.map((r) => ({
      ...r,
      basePricePerPerson: Number(r.basePricePerPerson ?? 0),
    }));
  } catch (err) {
    console.error("[admin/tipos-evento] load failed:", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tipos de evento</h1>
          <p className="text-sm text-muted-foreground">
            Casamentos, aniversários, corporativos… o que aparece no /reservar e
            nos cards da home. Arraste pra reordenar.
          </p>
        </div>
        <Link
          href="/admin/tipos-evento/novo"
          className={cn(buttonVariants({ size: "sm" }), "gap-2")}
        >
          <Plus className="size-4" />
          Novo tipo
        </Link>
      </div>

      <EventTypesList items={items} />
    </div>
  );
}
