"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { BusinessSettingsData } from "@/lib/business-settings";
import { cn } from "@/lib/utils";

import {
  SAVE_SETTINGS_INITIAL,
  saveBusinessSettings,
  type SaveSettingsState,
} from "./actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <header className="mb-4 border-b border-border pb-3">
        <h2 className="font-semibold">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function BusinessSettingsForm({
  initial,
}: {
  initial: BusinessSettingsData;
}) {
  const [state, formAction, pending] = useActionState<SaveSettingsState, FormData>(
    saveBusinessSettings,
    SAVE_SETTINGS_INITIAL,
  );
  const fe = state.fieldErrors;

  const [hours, setHours] = useState(initial.hours);
  function addHourRow() {
    if (hours.length >= 7) return;
    setHours((h) => [...h, { label: "", value: "" }]);
  }
  function removeHourRow(idx: number) {
    setHours((h) => h.filter((_, i) => i !== idx));
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Identidade */}
      <Section
        title="Identidade do negócio"
        description="Aparece no header, footer e em todos os e-mails enviados ao cliente."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nome de exibição</Label>
            <Input id="name" name="name" defaultValue={initial.name} required />
            <FieldError errors={fe?.["name"]} />
          </div>
          <div>
            <Label htmlFor="legalName">Razão social</Label>
            <Input
              id="legalName"
              name="legalName"
              defaultValue={initial.legalName}
              required
            />
            <FieldError errors={fe?.["legalName"]} />
          </div>
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" name="cnpj" defaultValue={initial.cnpj} placeholder="00.000.000/0000-00" />
            <FieldError errors={fe?.["cnpj"]} />
          </div>
        </div>
      </Section>

      {/* Endereço */}
      <Section title="Endereço" description="Aparece no footer, página de contato e schema.org de SEO local.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="address.street">Logradouro</Label>
            <Input id="address.street" name="address.street" defaultValue={initial.address.street} />
            <FieldError errors={fe?.["address.street"]} />
          </div>
          <div>
            <Label htmlFor="address.neighborhood">Bairro</Label>
            <Input id="address.neighborhood" name="address.neighborhood" defaultValue={initial.address.neighborhood} />
          </div>
          <div>
            <Label htmlFor="address.city">Cidade</Label>
            <Input id="address.city" name="address.city" defaultValue={initial.address.city} />
          </div>
          <div>
            <Label htmlFor="address.state">UF</Label>
            <Input id="address.state" name="address.state" defaultValue={initial.address.state} maxLength={2} />
            <FieldError errors={fe?.["address.state"]} />
          </div>
          <div>
            <Label htmlFor="address.zip">CEP</Label>
            <Input id="address.zip" name="address.zip" defaultValue={initial.address.zip} placeholder="00000-000" />
          </div>
          <div>
            <Label htmlFor="address.lat">Latitude</Label>
            <Input id="address.lat" name="address.lat" type="number" step="any" defaultValue={initial.address.lat} />
          </div>
          <div>
            <Label htmlFor="address.lng">Longitude</Label>
            <Input id="address.lng" name="address.lng" type="number" step="any" defaultValue={initial.address.lng} />
          </div>
          <input type="hidden" name="address.country" value={initial.address.country} />
        </div>
      </Section>

      {/* Contato */}
      <Section title="Contato" description="WhatsApp deve ter DDI+DDD+número, só dígitos. Ex.: 5511999999999.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact.whatsappNumber">WhatsApp (só dígitos com DDI)</Label>
            <Input
              id="contact.whatsappNumber"
              name="contact.whatsappNumber"
              defaultValue={initial.contact.whatsappNumber}
              inputMode="tel"
              placeholder="5511999999999"
              required
            />
            <FieldError errors={fe?.["contact.whatsappNumber"]} />
          </div>
          <div>
            <Label htmlFor="contact.phone">Telefone (formatado)</Label>
            <Input
              id="contact.phone"
              name="contact.phone"
              defaultValue={initial.contact.phone}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="contact.email">E-mail</Label>
            <Input id="contact.email" name="contact.email" type="email" defaultValue={initial.contact.email} required />
            <FieldError errors={fe?.["contact.email"]} />
          </div>
          <div>
            <Label htmlFor="contact.instagram">Instagram (URL)</Label>
            <Input
              id="contact.instagram"
              name="contact.instagram"
              type="url"
              defaultValue={initial.contact.instagram ?? ""}
              placeholder="https://instagram.com/..."
            />
            <FieldError errors={fe?.["contact.instagram"]} />
          </div>
          <div>
            <Label htmlFor="contact.facebook">Facebook (URL)</Label>
            <Input
              id="contact.facebook"
              name="contact.facebook"
              type="url"
              defaultValue={initial.contact.facebook ?? ""}
              placeholder="https://facebook.com/..."
            />
            <FieldError errors={fe?.["contact.facebook"]} />
          </div>
          <div>
            <Label htmlFor="contact.tiktok">TikTok (URL)</Label>
            <Input
              id="contact.tiktok"
              name="contact.tiktok"
              type="url"
              defaultValue={initial.contact.tiktok ?? ""}
              placeholder="https://tiktok.com/@..."
            />
          </div>
          <div>
            <Label htmlFor="contact.youtube">YouTube (URL)</Label>
            <Input
              id="contact.youtube"
              name="contact.youtube"
              type="url"
              defaultValue={initial.contact.youtube ?? ""}
              placeholder="https://youtube.com/@..."
            />
          </div>
        </div>
      </Section>

      {/* Horário */}
      <Section title="Horário de atendimento" description="Como aparece no footer e na página de contato.">
        <input type="hidden" name="hours.length" value={hours.length} />
        <div className="space-y-3">
          {hours.map((h, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
              <Input
                name={`hours.${i}.label`}
                defaultValue={h.label}
                placeholder="Ex.: Segunda a sexta"
              />
              <Input
                name={`hours.${i}.value`}
                defaultValue={h.value}
                placeholder="Ex.: 9h às 18h"
              />
              <button
                type="button"
                onClick={() => removeHourRow(i)}
                className="text-xs text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>
          ))}
          {hours.length < 7 && (
            <button
              type="button"
              onClick={addHourRow}
              className="text-xs text-accent hover:underline"
            >
              + Adicionar linha
            </button>
          )}
        </div>
      </Section>

      {/* Stats */}
      <Section title="Estatísticas exibidas" description="Aparecem na seção de prova social da home e nos schemas de SEO.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="stats.eventsCompleted">Eventos realizados</Label>
            <Input
              id="stats.eventsCompleted"
              name="stats.eventsCompleted"
              type="number"
              min={0}
              defaultValue={initial.stats.eventsCompleted}
            />
          </div>
          <div>
            <Label htmlFor="stats.maxCapacity">Capacidade máxima</Label>
            <Input
              id="stats.maxCapacity"
              name="stats.maxCapacity"
              type="number"
              min={1}
              defaultValue={initial.stats.maxCapacity}
            />
          </div>
          <div>
            <Label htmlFor="stats.rating">Avaliação média (0-5)</Label>
            <Input
              id="stats.rating"
              name="stats.rating"
              type="number"
              min={0}
              max={5}
              step="0.1"
              defaultValue={initial.stats.rating}
            />
          </div>
        </div>
      </Section>

      {/* Política */}
      <Section title="Política de reserva" description="Define o sinal padrão e o tempo de bloqueio temporário durante o checkout.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="policy.depositPercent">Sinal padrão (%)</Label>
            <Input
              id="policy.depositPercent"
              name="policy.depositPercent"
              type="number"
              min={0}
              max={100}
              defaultValue={initial.policy.depositPercent}
            />
          </div>
          <div>
            <Label htmlFor="policy.softLockMinutes">Trava temporária no checkout (minutos)</Label>
            <Input
              id="policy.softLockMinutes"
              name="policy.softLockMinutes"
              type="number"
              min={1}
              max={180}
              defaultValue={initial.policy.softLockMinutes}
            />
          </div>
        </div>
      </Section>

      {/* Save */}
      <div className="sticky bottom-0 -mx-6 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {state.status === "ok" && (
              <p className="text-sm text-emerald-700">✓ {state.message}</p>
            )}
            {state.status === "error" && state.message && (
              <p
                className={cn(
                  "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
                )}
                role="alert"
              >
                {state.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={pending} size="md">
            {pending ? "Salvando…" : "Salvar configurações"}
          </Button>
        </div>
      </div>
    </form>
  );
}
