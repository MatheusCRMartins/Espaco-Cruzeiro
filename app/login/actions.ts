"use server";

import { headers } from "next/headers";

import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = {
  status: "idle" | "ok" | "error";
  message?: string;
};

export const LOGIN_INITIAL: LoginState = { status: "idle" };

const LOGIN_LIMIT_PER_IP = 8; // 8 tentativas
const LOGIN_WINDOW_SECONDS = 60 * 10; // em 10 minutos
const LOGIN_LIMIT_PER_EMAIL = 5;

/**
 * Login admin via Server Action — passa pelo rate limiter e roda
 * supabase.auth.signInWithPassword no servidor (cookies setados via
 * createServerClient).
 *
 * Vantagens vs chamada client-side direta:
 *  - rate limiting (atacante não consegue brute-force em loop)
 *  - cookies setados server-side; UA não vê tokens
 *  - mensagens genéricas pro user (não vaza se email existe ou não)
 */
export async function signInAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Preencha e-mail e senha." };
  }

  const h = await headers();
  const ip = getClientIp(h);

  // Rate-limit por IP (acumulado entre tentativas com emails diferentes)
  const ipResult = await rateLimit({
    key: `login:ip:${ip}`,
    limit: LOGIN_LIMIT_PER_IP,
    windowSeconds: LOGIN_WINDOW_SECONDS,
  });
  if (!ipResult.ok) {
    return {
      status: "error",
      message: `Muitas tentativas. Tente novamente em ${ipResult.retryAfterSeconds}s.`,
    };
  }

  // Rate-limit por email (mesmo email não bate em 50 senhas)
  const emailResult = await rateLimit({
    key: `login:email:${email}`,
    limit: LOGIN_LIMIT_PER_EMAIL,
    windowSeconds: LOGIN_WINDOW_SECONDS,
  });
  if (!emailResult.ok) {
    return {
      status: "error",
      message: `Conta bloqueada temporariamente. Tente em ${emailResult.retryAfterSeconds}s.`,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { status: "error", message: "E-mail ou senha inválidos." };
    }
    return { status: "ok" };
  } catch (err) {
    console.error("[login] signIn failed:", err);
    return {
      status: "error",
      message: "Não foi possível entrar agora. Tente novamente.",
    };
  }
}
