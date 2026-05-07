"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

type Status =
  | { phase: "loading" }
  | { phase: "confirmed"; code: string; date: string }
  | { phase: "pending"; code: string }
  | { phase: "error" };

export function SucessoClient({
  bookingId,
  mock = false,
}: {
  bookingId: string | null;
  mock?: boolean;
}) {
  const [status, setStatus] = useState<Status>({ phase: "loading" });

  useEffect(() => {
    if (!bookingId) {
      setStatus({ phase: "error" });
      return;
    }

    let stop = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 20; // ~60s

    async function check() {
      if (stop) return;
      attempts++;

      try {
        const r = await fetch(`/api/bookings/${bookingId}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as {
          status: string;
          bookingCode: string;
          eventDate: string;
        };

        // Em modo mock (sem MP configurado), consideramos "confirmed" imediatamente
        if (mock) {
          setStatus({
            phase: "confirmed",
            code: json.bookingCode,
            date: json.eventDate,
          });
          return;
        }

        if (json.status === "confirmed") {
          setStatus({
            phase: "confirmed",
            code: json.bookingCode,
            date: json.eventDate,
          });
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          setStatus({ phase: "pending", code: json.bookingCode });
          return;
        }

        setTimeout(check, 3000);
      } catch (err) {
        console.error(err);
        if (attempts >= MAX_ATTEMPTS) {
          setStatus({ phase: "error" });
        } else {
          setTimeout(check, 3000);
        }
      }
    }

    check();
    return () => {
      stop = true;
    };
  }, [bookingId, mock]);

  if (status.phase === "loading") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <Clock className="mx-auto size-10 animate-pulse text-accent" />
        <h1 className="mt-4 font-display text-3xl font-semibold">
          Confirmando seu pagamento…
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Isso leva alguns segundos. Não feche esta janela.
        </p>
      </div>
    );
  }

  if (status.phase === "confirmed") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-[color:oklch(0.6_0.14_155)]" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Reserva confirmada</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Seu código é{" "}
          <strong className="text-foreground">{status.code}</strong>. Enviamos todos os
          detalhes para o seu e-mail.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Evento em <strong className="text-foreground">{status.date}</strong>.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonVariants({ variant: "outline", size: "md" })}>
            Voltar pro início
          </Link>
        </div>
      </div>
    );
  }

  if (status.phase === "pending") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <Clock className="mx-auto size-10 text-accent" />
        <h1 className="mt-4 font-display text-3xl font-semibold">
          Pagamento em análise
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Recebemos sua solicitação (<strong>{status.code}</strong>). Assim que o
          pagamento for aprovado, enviaremos a confirmação no seu e-mail. Se tiver
          dúvidas, fale com a gente no WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-destructive/40 bg-destructive/5 p-10 text-center">
      <h1 className="font-display text-2xl font-semibold text-destructive">
        Não encontramos sua reserva
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Se você fez o pagamento e não recebeu confirmação, entre em contato pelo
        WhatsApp informando seu nome completo.
      </p>
    </div>
  );
}
