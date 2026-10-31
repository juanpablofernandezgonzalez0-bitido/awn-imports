import { NextResponse } from "next/server";
import { hasSession } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ authorized: await hasSession() });
}