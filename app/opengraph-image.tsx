import { ImageResponse } from "next/og";

import { getBusinessSettings } from "@/lib/business-settings";

export const runtime = "nodejs";
export const alt = "Buffet e eventos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const settings = await getBusinessSettings();
  const BUSINESS = settings;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          // verde profundo → dourado sutil no canto
          background:
            "radial-gradient(ellipse at top right, rgba(214, 176, 103, 0.45), transparent 55%), linear-gradient(135deg, #1d3a2c 0%, #132821 100%)",
          color: "#f6f1e5",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#d6b067",
          }}
        >
          {BUSINESS.address.city} · {BUSINESS.address.state}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 80,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            {BUSINESS.name}
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.25,
              color: "rgba(246, 241, 229, 0.82)",
              maxWidth: 900,
            }}
          >
            Eventos que você vai querer lembrar pra sempre.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "rgba(246, 241, 229, 0.7)",
          }}
        >
          <div style={{ display: "flex" }}>
            Casamentos · Aniversários · Corporativos
          </div>
          <div
            style={{
              display: "flex",
              padding: "12px 24px",
              borderRadius: 999,
              background: "#d6b067",
              color: "#1d3a2c",
              fontWeight: 600,
            }}
          >
            espacocruzeiro.com.br
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
