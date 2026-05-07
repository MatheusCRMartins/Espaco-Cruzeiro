import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

import { getBusinessSettings } from "@/lib/business-settings";
import { LEGAL_LINKS } from "@/lib/constants";
import { waLink } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export async function SiteFooter() {
  const settings = await getBusinessSettings();
  const waNumber = settings.contact.whatsappNumber;

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-xl font-semibold">{settings.name}</p>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Buffet em {settings.address.city} para os momentos que você quer guardar pra sempre:
              casamentos, aniversários, chá de bebê, revelação e eventos corporativos.
            </p>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" aria-hidden />
                {settings.address.street} — {settings.address.neighborhood},{" "}
                {settings.address.city}/{settings.address.state}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-primary" aria-hidden />
                <a href={`tel:+${waNumber}`} className="hover:text-foreground">
                  {settings.contact.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-primary" aria-hidden />
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="hover:text-foreground"
                >
                  {settings.contact.email}
                </a>
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Eventos</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/eventos/casamentos" className="hover:text-foreground">Casamentos</Link></li>
              <li><Link href="/eventos/aniversarios" className="hover:text-foreground">Aniversários</Link></li>
              <li><Link href="/eventos/cha-de-bebe" className="hover:text-foreground">Chá de bebê</Link></li>
              <li><Link href="/eventos/revelacao" className="hover:text-foreground">Revelação</Link></li>
              <li><Link href="/eventos/corporativos" className="hover:text-foreground">Corporativos</Link></li>
              <li><Link href="/eventos/confraternizacoes" className="hover:text-foreground">Confraternizações</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Horário</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {settings.hours.map((h) => (
                <li key={h.label} className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 text-primary" aria-hidden />
                  <span>
                    <span className="block">{h.label}</span>
                    <span className="block text-foreground/70">{h.value}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-3">
              {settings.contact.instagram && (
                <a
                  href={settings.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-background"
                >
                  <InstagramIcon className="size-4" />
                </a>
              )}
              <a
                href={waLink(waNumber, `Olá! Gostaria de saber mais sobre o ${settings.name}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Fale no WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.legalName}. CNPJ {settings.cnpj}.
          </p>
          <ul className="flex flex-wrap gap-4">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
