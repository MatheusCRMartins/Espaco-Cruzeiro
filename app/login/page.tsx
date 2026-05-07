import { redirect } from "next/navigation";

import { LoginForm } from "./login-form";
import { getCurrentUser, isAdmin } from "@/lib/supabase/server";

export const metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const { next, error } = await props.searchParams;

  const user = await getCurrentUser();
  if (user && (await isAdmin())) {
    redirect(next && next.startsWith("/") ? next : "/admin");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Espaço Cruzeiro
          </p>
          <h1 className="text-3xl font-semibold">Painel administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Entre com sua conta para gerenciar reservas e conteúdo.
          </p>
        </div>
        <LoginForm next={next} initialError={error} />
      </div>
    </main>
  );
}
