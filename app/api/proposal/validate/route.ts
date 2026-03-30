import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: "No code provided" });
    }

    const validCodes = (process.env.ACCESS_CODES || "").split(",").map(c => c.trim().toUpperCase());
    const isValid = validCodes.includes(code.trim().toUpperCase());

    return NextResponse.json({ valid: isValid });
  } catch {
    return NextResponse.json({ valid: false, error: "Validation failed" });
  }
}