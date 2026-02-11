import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For demo, always return connected = true to show mock events
    // In production, check if user has Google OAuth tokens stored
    const connected = true;

    return NextResponse.json({ connected });
  } catch (error) {
    console.error("Calendar status error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
