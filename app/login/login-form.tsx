"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { LOGIN_INITIAL, signInAction, type LoginState } from "./actions";

export function LoginForm({
  next,
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    signInAction,
    LOGIN_INITIAL,
  );

  // Em sucesso, redireciona pro destino (cookies já estão setados no servidor)
  useEffect(() => {
    if (state.status === "ok") {
      const target = next && next.startsWith("/") ? next : "/admin";
      router.replace(target);
      router.refresh();
    }
  }, [state.status, next, router]);

  const initialMessage =
    initialError === "forbidden"
      ? "Você não tem permissão para acessar o painel."
      : null;
  const message = state.message ?? initialMessage;

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm">
        <span className="text-foreground">E-mail</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <label className="block text-sm">
        <span className="text-foreground">Senha</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      {message && state.status !== "ok" && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
