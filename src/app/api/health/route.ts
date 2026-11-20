import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ estado: "ok" }, { status: 200 });
}
