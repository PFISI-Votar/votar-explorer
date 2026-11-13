import { NextRequest, NextResponse } from "next/server";
import { isAddress, isHash } from "viem";
import { getRpcClient } from "@/lib/rpc";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (isAddress(query)) return NextResponse.redirect(new URL(`/address/${query}`, request.url));
  if (/^(0|[1-9]\d*)$/.test(query)) return NextResponse.redirect(new URL(`/block/${query}`, request.url));
  if (isHash(query)) {
    try { await getRpcClient().getTransaction({ hash: query }); return NextResponse.redirect(new URL(`/tx/${query}`, request.url)); }
    catch { return NextResponse.redirect(new URL(`/block/${query}`, request.url)); }
  }
  return NextResponse.redirect(new URL("/?search=invalid", request.url));
}
