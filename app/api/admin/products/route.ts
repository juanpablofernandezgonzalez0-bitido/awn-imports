import { NextResponse } from "next/server";
import { getProducts, saveProducts } from "@/lib/store";
import { hasSession } from "@/lib/auth";
import type { Product } from "@/lib/products";

export async function GET() {
  if (!(await hasSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json(await getProducts());
}

export async function PUT(request: Request) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as Product[] | null;
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  await saveProducts(body);
  return NextResponse.json({ ok: true });
}