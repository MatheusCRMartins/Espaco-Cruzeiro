"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

import { COUPON_INITIAL, createCoupon, type CouponState } from "./actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
}

export function CouponForm() {
  const [state, formAction, pending] = useActionState<CouponState, FormData>(
    createCoupon,
    COUPON_INITIAL,
  );
  const fe = state.fieldErrors;

  useEffect(() => {
    if (state.status === "ok") toast.success(state.message ?? "Cupom criado.");
    else if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-border bg-card p-5"
    >
      <h2 className="font-semibold">Novo cupom</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            name="code"
            required
            placeholder="BLACK20"
            pattern="[A-Za-z0-9_-]+"
            className="font-mono uppercase"
          />
          <FieldError errors={fe?.["code"]} />
          <p className="mt-1 text-xs text-muted-foreground">
            Letras, números, traço ou underline. Convertido pra MAIÚSCULAS.
          </p>
        </div>
        <div>
          <Label htmlFor="percentOff">Desconto (%) *</Label>
          <Input
            id="percentOff"
            name="percentOff"
            type="number"
            min={1}
            max={100}
            required
            defaultValue={10}
          />
          <FieldError errors={fe?.["percentOff"]} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Descrição interna (opcional)</Label>
          <Input
            id="description"
            name="description"
            placeholder="Ex.: campanha black friday 2026"
          />
        </div>
        <div>
          <Label htmlFor="maxUses">Limite de usos (opcional)</Label>
          <Input id="maxUses" name="maxUses" type="number" min={1} placeholder="ilimitado" />
        </div>
        <label className="inline-flex items-end gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked className="size-4" />
          Ativo
        </label>
        <div>
          <Label htmlFor="validFrom">Válido a partir de (opcional)</Label>
          <Input id="validFrom" name="validFrom" type="datetime-local" />
        </div>
        <div>
          <Label htmlFor="validUntil">Válido até (opcional)</Label>
          <Input id="validUntil" name="validUntil" type="datetime-local" />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Criando…" : "Criar cupom"}
      </Button>
    </form>
  );
}
