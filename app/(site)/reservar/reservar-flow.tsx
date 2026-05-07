"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cn, formatBRL } from "@/lib/utils";

import { CalendarPicker } from "./calendar-picker";

type EventTypeOption = {
  id: string; // uuid from db
  slug: string;
  name: string;
  description: string | null;
  minGuests: number | null;
  maxGuests: number | null;
  basePricePerPerson: number;
  durationHours: number;
};

type Props = {
  eventTypes: EventTypeOption[];
};

type StepKey = "tipo" | "data" | "convidados" | "contato" | "pagamento";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "tipo", label: "Tipo" },
  { key: "data", label: "Data" },
  { key: "convidados", label: "Convidados" },
  { key: "contato", label: "Contato" },
  { key: "pagamento", label: "Pagamento" },
];

type FormState = {
  eventTypeId: string | null;
  eventDate: string | null;
  eventStartTime: string | null;
  guestsCount: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  notes: string;
  paymentType: "deposit" | "full";
  consent: boolean;
  website: string; // honeypot
  couponCode: string;
};

const INITIAL: FormState = {
  eventTypeId: null,
  eventDate: null,
  eventStartTime: null,
  guestsCount: 50,
  name: "",
  email: "",
  phone: "",
  cpf: "",
  notes: "",
  paymentType: "deposit",
  consent: false,
  website: "",
  couponCode: "",
};

type CouponState =
  | { phase: "idle" }
  | { phase: "checking" }
  | { phase: "ok"; code: string; percentOff: number; description: string | null }
  | { phase: "error"; message: string };

export function ReservarFlow({ eventTypes }: Props) {
  const [step, setStep] = useState<StepKey>("tipo");
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<CouponState>({ phase: "idle" });

  const selectedType = useMemo(
    () => eventTypes.find((e) => e.id === form.eventTypeId) ?? null,
    [form.eventTypeId, eventTypes],
  );

  const amounts = useMemo(() => {
    if (!selectedType) return null;
    const baseTotal = selectedType.basePricePerPerson * form.guestsCount;
    const percentOff = coupon.phase === "ok" ? coupon.percentOff : 0;
    const discount = Math.round(baseTotal * percentOff) / 100;
    const total = Math.round((baseTotal - discount) * 100) / 100;
    const deposit = Math.round(total * 0.3 * 100) / 100;
    return {
      baseTotal: Math.round(baseTotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total,
      deposit,
      payableNow: form.paymentType === "full" ? total : deposit,
    };
  }, [selectedType, form.guestsCount, form.paymentType, coupon]);

  async function applyCoupon() {
    const code = form.couponCode.trim().toUpperCase();
    if (!code) {
      setCoupon({ phase: "idle" });
      return;
    }
    setCoupon({ phase: "checking" });
    try {
      const r = await fetch(
        `/api/coupons/validate?code=${encodeURIComponent(code)}`,
      );
      const json = (await r.json()) as
        | { ok: true; code: string; percentOff: number; description: string | null }
        | { ok: false; message: string };
      if (!("ok" in json) || !json.ok) {
        setCoupon({
          phase: "error",
          message: ("message" in json && json.message) || "Cupom inválido.",
        });
      } else {
        setCoupon({
          phase: "ok",
          code: json.code,
          percentOff: json.percentOff,
          description: json.description,
        });
      }
    } catch {
      setCoupon({ phase: "error", message: "Erro ao validar. Tente de novo." });
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const canNext = (): boolean => {
    switch (step) {
      case "tipo":
        return !!form.eventTypeId;
      case "data":
        return !!form.eventDate && !!form.eventStartTime;
      case "convidados":
        return (
          !!selectedType &&
          form.guestsCount >= (selectedType.minGuests ?? 1) &&
          form.guestsCount <= (selectedType.maxGuests ?? 2000)
        );
      case "contato":
        return (
          form.name.trim().length >= 2 &&
          /\S+@\S+\.\S+/.test(form.email) &&
          form.phone.replace(/\D/g, "").length >= 10 &&
          form.cpf.replace(/\D/g, "").length === 11
        );
      case "pagamento":
        return form.consent;
    }
  };

  function goNext() {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].key);
  }
  function goPrev() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key);
  }

  async function handleSubmit() {
    if (!canNext() || !form.eventTypeId || !form.eventDate || !form.eventStartTime) return;
    setSubmitting(true);
    setApiError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventTypeId: form.eventTypeId,
          eventDate: form.eventDate,
          eventStartTime: form.eventStartTime,
          guestsCount: form.guestsCount,
          paymentType: form.paymentType,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          customerCpf: form.cpf,
          notes: form.notes || null,
          couponCode: coupon.phase === "ok" ? coupon.code : undefined,
          consent: form.consent,
          website: form.website,
        }),
      });

      const payload = (await res.json()) as
        | { checkoutUrl: string; bookingId: string }
        | { error: string; reason?: string };

      if (!res.ok || !("checkoutUrl" in payload)) {
        const msg =
          "error" in payload && payload.error === "date_unavailable"
            ? "Essa data acabou de ser reservada. Escolha outra, por favor."
            : "Não conseguimos criar sua reserva. Tente novamente.";
        setApiError(msg);
        return;
      }

      window.location.href = payload.checkoutUrl;
    } catch (err) {
      console.error(err);
      setApiError("Erro de conexão. Verifique sua internet e tente de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Steps + content */}
      <div>
        {/* Stepper */}
        <ol className="mb-8 flex items-center gap-2 text-xs font-medium">
          {STEPS.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full border",
                    active && "border-accent bg-accent text-accent-foreground",
                    done && "border-accent bg-accent/20 text-accent-foreground",
                    !active && !done && "border-border text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden sm:inline",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <span className="w-6 text-muted-foreground/60">—</span>}
              </li>
            );
          })}
        </ol>

        {/* Step content */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          {step === "tipo" && (
            <div>
              <h2 className="font-display text-2xl font-semibold">Qual é o evento?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Escolha a categoria — afinamos os detalhes na reunião.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {eventTypes.map((t) => (
                  <li key={t.id}>
                    <label
                      className={cn(
                        "flex h-full cursor-pointer flex-col gap-2 rounded-xl border p-4 transition",
                        form.eventTypeId === t.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/60",
                      )}
                    >
                      <input
                        type="radio"
                        name="eventType"
                        value={t.id}
                        className="sr-only"
                        checked={form.eventTypeId === t.id}
                        onChange={() =>
                          setForm((f) => ({
                            ...f,
                            eventTypeId: t.id,
                            guestsCount: Math.max(
                              t.minGuests ?? 1,
                              Math.min(t.maxGuests ?? 2000, f.guestsCount),
                            ),
                          }))
                        }
                      />
                      <span className="font-display text-lg font-semibold">{t.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatBRL(t.basePricePerPerson)} / pessoa · {t.minGuests}–{t.maxGuests}{" "}
                        convidados
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === "data" && form.eventTypeId && (
            <div>
              <h2 className="font-display text-2xl font-semibold">Escolha a data</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                As datas em destaque estão livres. Clique para selecionar.
              </p>
              <div className="mt-6">
                <CalendarPicker
                  eventTypeId={form.eventTypeId}
                  value={form.eventDate}
                  onChange={(date, slot) =>
                    setForm((f) => ({
                      ...f,
                      eventDate: date,
                      eventStartTime: slot.startTime,
                    }))
                  }
                />
              </div>
              {form.eventDate && form.eventStartTime && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Data selecionada: <strong className="text-foreground">{form.eventDate}</strong>{" "}
                  · início às{" "}
                  <strong className="text-foreground">{form.eventStartTime}</strong>.
                </p>
              )}
            </div>
          )}

          {step === "convidados" && selectedType && (
            <div>
              <h2 className="font-display text-2xl font-semibold">Quantos convidados?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedType.minGuests}–{selectedType.maxGuests} pessoas.
              </p>
              <div className="mt-6 grid gap-4">
                <input
                  type="range"
                  min={selectedType.minGuests ?? 1}
                  max={selectedType.maxGuests ?? 2000}
                  step={5}
                  value={form.guestsCount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guestsCount: Number(e.target.value) }))
                  }
                  className="w-full accent-[var(--accent)]"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedType.minGuests}
                  </span>
                  <span className="font-display text-3xl font-semibold">
                    {form.guestsCount} pessoas
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {selectedType.maxGuests}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === "contato" && (
            <div>
              <h2 className="font-display text-2xl font-semibold">Seus dados</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Só coletamos o que precisamos para emitir o contrato.
              </p>
              {/* honeypot */}
              <div className="hidden" aria-hidden>
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input
                    id="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    inputMode="numeric"
                    value={form.cpf}
                    onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>
              <div className="mt-5">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Alergias, acessibilidade, restrições…"
                />
              </div>
            </div>
          )}

          {step === "pagamento" && selectedType && amounts && (
            <div>
              <h2 className="font-display text-2xl font-semibold">Pagamento</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Pague um sinal de 30% agora e garanta a data. O restante é quitado até 15 dias
                antes do evento.
              </p>

              <div className="mt-6 grid gap-3">
                {(["deposit", "full"] as const).map((pt) => (
                  <label
                    key={pt}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition",
                      form.paymentType === pt
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/60",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentType"
                        value={pt}
                        checked={form.paymentType === pt}
                        onChange={() => setForm((f) => ({ ...f, paymentType: pt }))}
                      />
                      <div>
                        <p className="font-medium">
                          {pt === "deposit" ? "Sinal de 30%" : "Pagamento integral"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pt === "deposit"
                            ? "Segura a data agora, paga o resto depois."
                            : "Acaba de uma vez."}
                        </p>
                      </div>
                    </div>
                    <span className="font-display text-lg font-semibold">
                      {formatBRL(pt === "deposit" ? amounts.deposit : amounts.total)}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cupom de desconto
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={form.couponCode}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        couponCode: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="EX: BLACK20"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={coupon.phase === "ok"}
                  />
                  {coupon.phase === "ok" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCoupon({ phase: "idle" });
                        setForm((f) => ({ ...f, couponCode: "" }));
                      }}
                      className="rounded-md border border-border bg-background px-3 text-xs hover:bg-muted"
                    >
                      Remover
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={
                        coupon.phase === "checking" || !form.couponCode.trim()
                      }
                      className="rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      {coupon.phase === "checking" ? "Validando…" : "Aplicar"}
                    </button>
                  )}
                </div>
                {coupon.phase === "ok" && (
                  <p className="mt-2 text-xs text-emerald-700">
                    ✓ Cupom <strong>{coupon.code}</strong> aplicado —{" "}
                    {coupon.percentOff}% de desconto.
                  </p>
                )}
                {coupon.phase === "error" && (
                  <p className="mt-2 text-xs text-destructive">{coupon.message}</p>
                )}
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, consent: e.target.checked }))
                  }
                  className="mt-1 size-4 rounded border-border text-primary"
                />
                <span>
                  Li e aceito os{" "}
                  <a
                    href="/termos-de-uso"
                    target="_blank"
                    className="underline underline-offset-2 hover:text-foreground"
                    rel="noopener noreferrer"
                  >
                    Termos
                  </a>
                  , a{" "}
                  <a
                    href="/politica-de-privacidade"
                    target="_blank"
                    className="underline underline-offset-2 hover:text-foreground"
                    rel="noopener noreferrer"
                  >
                    Política de Privacidade
                  </a>{" "}
                  e a{" "}
                  <a
                    href="/politica-de-cancelamento"
                    target="_blank"
                    className="underline underline-offset-2 hover:text-foreground"
                    rel="noopener noreferrer"
                  >
                    Política de Cancelamento
                  </a>
                  .
                </span>
              </label>

              {apiError && (
                <p
                  className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  role="alert"
                >
                  {apiError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-0"
          >
            <ChevronLeft className="size-4" /> Voltar
          </button>
          {step !== "pagamento" ? (
            <Button size="md" disabled={!canNext()} onClick={goNext}>
              Continuar
            </Button>
          ) : (
            <Button size="lg" disabled={!canNext() || submitting} onClick={handleSubmit}>
              {submitting ? "Processando…" : "Pagar e garantir data"}
              <Sparkles className="ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Summary sidebar */}
      <aside className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Resumo</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Tipo</dt>
            <dd className="text-right text-foreground">
              {selectedType?.name ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Data</dt>
            <dd className="text-right text-foreground">{form.eventDate ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Horário</dt>
            <dd className="text-right text-foreground">
              {form.eventStartTime ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Convidados</dt>
            <dd className="text-right text-foreground">{form.guestsCount}</dd>
          </div>
        </dl>

        {amounts && (
          <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
            {coupon.phase === "ok" && amounts.discount > 0 ? (
              <>
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBRL(amounts.baseTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Cupom {coupon.code} ({coupon.percentOff}%)</span>
                  <span>− {formatBRL(amounts.discount)}</span>
                </div>
              </>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total estimado</span>
              <span>{formatBRL(amounts.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sinal (30%)</span>
              <span>{formatBRL(amounts.deposit)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-display text-base">
              <span>A pagar agora</span>
              <span className="font-semibold">{formatBRL(amounts.payableNow)}</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
