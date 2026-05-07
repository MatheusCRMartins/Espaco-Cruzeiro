"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Pencil, Eye, EyeOff } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn, formatBRL } from "@/lib/utils";

import { deleteEventType, reorderEventTypes, toggleEventType } from "./actions";

export type EventTypeListItem = {
  id: string;
  slug: string;
  name: string;
  basePricePerPerson: number;
  minGuests: number | null;
  maxGuests: number | null;
  durationHours: number;
  displayOrder: number;
  active: boolean;
};

function SortableRow({
  item,
  onToggle,
  onDelete,
  busy,
}: {
  item: EventTypeListItem;
  onToggle: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-card p-3 text-sm",
        !item.active && "opacity-60",
      )}
    >
      <button
        type="button"
        aria-label="Reordenar"
        className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{item.name}</p>
          {!item.active && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              oculto
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          <code className="font-mono">{item.slug}</code>
          {" · "}
          {formatBRL(item.basePricePerPerson)}/pessoa
          {" · "}
          {item.minGuests}–{item.maxGuests} convidados · {item.durationHours}h
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          aria-label={item.active ? "Despublicar" : "Publicar"}
          title={item.active ? "Despublicar" : "Publicar"}
          className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          {item.active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
        <Link
          href={`/admin/tipos-evento/${item.id}`}
          aria-label="Editar"
          title="Editar"
          className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-4" />
        </Link>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label="Excluir"
          title="Excluir"
          className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}

export function EventTypesList({ items }: { items: EventTypeListItem[] }) {
  const [list, setList] = useState(items);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = list.findIndex((it) => it.id === active.id);
    const newIndex = list.findIndex((it) => it.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(list, oldIndex, newIndex);
    setList(reordered); // optimistic
    setError(null);

    start(async () => {
      const result = await reorderEventTypes(reordered.map((it) => it.id));
      if (!result.ok) {
        setList(items); // rollback
        setError("Não consegui salvar a nova ordem. Tente de novo.");
      }
    });
  }

  function handleToggle(id: string, currentActive: boolean) {
    start(async () => {
      // optimistic
      setList((cur) =>
        cur.map((it) => (it.id === id ? { ...it, active: !currentActive } : it)),
      );
      setError(null);
      const result = await toggleEventType(id, !currentActive);
      if (!result.ok) {
        setList(items); // rollback
        setError("Não consegui atualizar o status.");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    setPendingDelete({ id, name });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    const result = await deleteEventType(id);
    if (result.ok) {
      setList((cur) => cur.filter((it) => it.id !== id));
      setError(null);
    } else {
      setError(result.error ?? "Não consegui excluir.");
    }
  }

  if (list.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum tipo cadastrado ainda. Crie o primeiro pelo botão acima.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={list.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {list.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
                busy={pending}
                onToggle={() => handleToggle(item.id, item.active)}
                onDelete={() => handleDelete(item.id, item.name)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <p className="text-xs text-muted-foreground">
        Arraste pelo ícone à esquerda pra reordenar. Mudanças salvam automaticamente.
      </p>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Excluir "${pendingDelete?.name ?? ""}"?`}
        description={
          <>
            Isso é irreversível. Se houver reservas usando esse tipo, a
            exclusão é bloqueada — desative em vez de excluir.
          </>
        }
        confirmPhrase="EXCLUIR"
        confirmLabel="Excluir tipo"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
