import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { hasSession } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Sin archivo" }, { status: 400 });
  }

  /* ── Vercel Blob (producción) ── */
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const blob = await put(`products/${filename}`, file, {
      access: "public",
    });
    return NextResponse.json({ url: blob.url });
  }

  /* ── Filesystem (local) ── */
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), bytes);

  return NextResponse.json({ url: `/uploads/${name}` });
}