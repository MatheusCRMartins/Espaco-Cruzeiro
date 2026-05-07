"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  /** Palavra que o usuário precisa digitar pra liberar o confirmar. */
  confirmPhrase?: string;
  /** Label do botão de confirmar (default: "Confirmar"). */
  confirmLabel?: string;
  /** Tom destrutivo (vermelho). */
  destructive?: boolean;
  /** Callback quando o usuário confirma. Receber estado de loading. */
  onConfirm: () => Promise<void> | void;
};

/**
 * Modal de confirmação dupla — substituto do window.confirm.
 *
 * Padrão GitHub/Stripe: pede o usuário digitar uma frase específica pra
 * liberar o botão de confirmar. Reduz drasticamente cliques acidentais
 * em ações destrutivas (cancelar reserva, excluir registro, etc).
 *
 * Acessibilidade:
 *   - aria-modal + role=dialog + aria-labelledby
 *   - foco move pro input ou botão cancelar ao abrir
 *   - ESC fecha
 *   - click no backdrop fecha
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmPhrase,
  confirmLabel = "Confirmar",
  destructive = false,
  onConfirm,
}: Props) {
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setTyped("");
      setPending(false);
      return;
    }
    // foco inicial: input se houver phrase; senão cancel button
    setTimeout(() => {
      if (confirmPhrase) inputRef.current?.focus();
      else cancelRef.current?.focus();
    }, 30);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, confirmPhrase]);

  if (!open) return null;

  const canConfirm = !confirmPhrase || typed.trim() === confirmPhrase;

  async function handleConfirm() {
    if (!canConfirm || pending) return;
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 grid place-items-center p-4"
    >
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-lg border border-border bg-card shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full",
                destructive ? "bg-destructive/10 text-destructive" : "bg-muted",
              )}
            >
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h2 id="confirm-title" className="text-base font-semibold">
                {title}
              </h2>
              {description && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="p-5 space-y-3">
          {confirmPhrase && (
            <label className="block text-sm">
              <span className="text-foreground">
                Pra confirmar, digite{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {confirmPhrase}
                </code>
              </span>
              <Input
                ref={inputRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={confirmPhrase}
                className="mt-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canConfirm) {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
              />
            </label>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button
            ref={cancelRef}
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            size="sm"
            disabled={!canConfirm || pending}
            onClick={handleConfirm}
          >
            {pending ? "Processando…" : confirmLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}
