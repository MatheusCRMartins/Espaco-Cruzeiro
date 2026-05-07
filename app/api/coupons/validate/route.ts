import { NextResponse } from "next/server";

import { checkCoupon } from "@/lib/coupons";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/coupons/validate?code=XXX
 *
 * Endpoint público (anônimo) usado pelo checkout pra validar um código
 * e mostrar o desconto antes de finalizar.
 *
 * Rate-limit por IP pra evitar enumeração de códigos por brute-force.
 */
export async function GET(request: Request) {
  const ip = getClientIp(request.headers);
  const limit = await rateLimit({
    key: `coupon-validate:${ip}`,
    limit: 30,
    windowSeconds: 60 * 5, // 30 tentativas em 5min
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "";

  const result = await checkCoupon(code);
  if (!result.ok) {
    return NextResponse.json(result, { status: 200 });
  }

  return NextResponse.json(
    {
      ok: true,
      code: result.code,
      percentOff: result.percentOff,
      description: result.description,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
