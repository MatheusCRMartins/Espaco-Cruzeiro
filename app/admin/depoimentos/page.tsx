import { desc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

import { addTestimonial } from "./actions";
import { TestimonialRowActions } from "./testimonial-row-actions";

export const metadata = { title: "Depoimentos" };
export const dynamic = "force-dynamic";

export default async function TestimonialsAdminPage() {
  let rows: Array<{
    id: string;
    customerName: string;
    rating: number;
    content: string;
    eventDate: string | null;
    approved: boolean;
  }> = [];

  try {
    const db = getDb();
    rows = await db
      .select({
        id: schema.testimonials.id,
        customerName: schema.testimonials.customerName,
        rating: schema.testimonials.rating,
        content: schema.testimonials.content,
        eventDate: schema.testimonials.eventDate,
        approved: schema.testimonials.approved,
      })
      .from(schema.testimonials)
      .orderBy(desc(schema.testimonials.createdAt));
  } catch (err) {
    console.error("[admin/depoimentos] load failed:", err);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Depoimentos</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.length === 0 && (
          <p className="sm:col-span-2 rounded-lg border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Nenhum depoimento ainda.
          </p>
        )}
        {rows.map((t) => (
          <article key={t.id} className="rounded-lg border border-border bg-card p-4">
            <header className="flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold">{t.customerName}</p>
                <p className="text-muted-foreground">
                  {"★".repeat(t.rating)}
                  {"☆".repeat(5 - t.rating)}
                  {t.eventDate && ` · ${t.eventDate}`}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  t.approved
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {t.approved ? "publicado" : "oculto"}
              </span>
            </header>
            <blockquote className="mt-3 text-sm leading-6 text-foreground/90">
              &ldquo;{t.content}&rdquo;
            </blockquote>
            <div className="mt-3 border-t border-border pt-3">
              <TestimonialRowActions id={t.id} approved={t.approved} />
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-semibold">Adicionar depoimento</h2>
        <form
          action={async (fd) => {
            "use server";
            await addTestimonial(fd);
          }}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Nome do cliente</span>
            <input
              name="customerName"
              required
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Nota (1 a 5)</span>
            <input
              name="rating"
              type="number"
              min={1}
              max={5}
              defaultValue={5}
              required
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Data do evento (opcional)</span>
            <input
              name="eventDate"
              type="date"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            />
          </label>
          <label className="col-span-full flex flex-col gap-1 text-xs">
            <span className="font-medium">Depoimento</span>
            <textarea
              name="content"
              required
              rows={4}
              className="rounded-md border border-border bg-background p-3 text-sm"
            />
          </label>
          <label className="col-span-full inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="approved" className="size-4" /> Publicar no
            site imediatamente
          </label>
          <button className="col-span-full h-10 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Adicionar
          </button>
        </form>
      </section>
    </div>
  );
}
