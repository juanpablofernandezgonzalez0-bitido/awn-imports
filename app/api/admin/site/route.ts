import { NextResponse } from "next/server";
import { getSite, saveSite } from "@/lib/store";
import { hasSession } from "@/lib/auth";
import type { SiteConfig } from "@/lib/site";

export async function GET() {
  if (!(await hasSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json(await getSite());
}

export async function PUT(request: Request) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as SiteConfig | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  await saveSite(body);
  return NextResponse.json({ ok: true });
}