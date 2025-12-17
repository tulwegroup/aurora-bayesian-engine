import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Aurora API is working",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
}