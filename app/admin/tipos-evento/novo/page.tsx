import Link from "next/link";

import { EventTypeForm } from "../event-type-form";

export const metadata = { title: "Novo tipo de evento" };

export default function NewEventTypePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/tipos-evento"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Novo tipo de evento</h1>
        <p className="text-sm text-muted-foreground">
          Aparece no /reservar e nos cards da home depois de salvo (se ativo).
        </p>
      </div>

      <EventTypeForm mode="create" />
    </div>
  );
}
