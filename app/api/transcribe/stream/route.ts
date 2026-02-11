import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram API key not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: "wss://api.deepgram.com/v1/listen",
      model: "nova-2",
      language: "en-US",
    });
  } catch (error) {
    console.error("Stream setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup stream" },
      { status: 500 }
    );
  }
}
