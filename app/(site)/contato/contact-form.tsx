"use client";

import { useActionState } from "react";

import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { submitContact, type ContactActionState } from "./actions";

const INITIAL: ContactActionState = { status: "idle" };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, INITIAL);

  if (state.status === "ok") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h3 className="font-display text-2xl font-semibold">Mensagem enviada</h3>
        <p className="mt-3 text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  const fe = state.fieldErrors;

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      noValidate
    >
      {/* honeypot — invisível a humanos */}
      <div className="hidden" aria-hidden>
        <label>
          Não preencha:
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Como devemos te chamar?"
            aria-invalid={!!fe?.name}
          />
          <FieldError errors={fe?.name} />
        </div>
        <div>
          <Label htmlFor="phone">WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            aria-invalid={!!fe?.phone}
          />
          <FieldError errors={fe?.phone} />
        </div>
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
          aria-invalid={!!fe?.email}
        />
        <FieldError errors={fe?.email} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="estimatedDate">Data estimada (opcional)</Label>
          <Input
            id="estimatedDate"
            name="estimatedDate"
            type="date"
            aria-invalid={!!fe?.estimatedDate}
          />
          <FieldError errors={fe?.estimatedDate} />
        </div>
        <div>
          <Label htmlFor="estimatedGuests">Convidados (opcional)</Label>
          <Input
            id="estimatedGuests"
            name="estimatedGuests"
            type="number"
            min={1}
            max={2000}
            placeholder="Ex.: 80"
            aria-invalid={!!fe?.estimatedGuests}
          />
          <FieldError errors={fe?.estimatedGuests} />
        </div>
      </div>

      <div>
        <Label htmlFor="message">Sua mensagem</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Conta um pouco do evento — tipo, expectativas, dúvidas…"
          aria-invalid={!!fe?.message}
        />
        <FieldError errors={fe?.message} />
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span>
          Li e concordo com a{" "}
          <a
            href="/politica-de-privacidade"
            className="underline underline-offset-2 hover:text-foreground"
          >
            política de privacidade
          </a>{" "}
          e autorizo o contato sobre o meu evento.
        </span>
      </label>
      <FieldError errors={fe?.consent} />

      {state.status === "error" && state.message && (
        <p
          className={cn(
            "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
          )}
          role="alert"
        >
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Enviando…" : "Enviar mensagem"}
      </Button>
    </form>
  );
}
