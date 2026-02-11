import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { analyzeTranscript } from "@/lib/ai-analysis";
import { prisma } from "@/lib/prisma";

// Analyze a meeting transcript
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { meetingId, transcript } = body;

    if (!meetingId) {
      return NextResponse.json(
        { error: "Meeting ID required" },
        { status: 400 }
      );
    }

    // Get meeting and verify ownership
    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        user: { clerkId: userId },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Use provided transcript or meeting's stored transcript
    const textToAnalyze = transcript || meeting.transcript;

    if (!textToAnalyze || textToAnalyze.length < 50) {
      return NextResponse.json(
        { error: "Transcript too short for analysis" },
        { status: 400 }
      );
    }

    // Run AI analysis
    const analysis = await analyzeTranscript(textToAnalyze);

    // Update meeting with analysis results
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        title: analysis.title,
        summary: analysis.summary,
        actionItems: analysis.actionItems,
        sentiment: analysis.sentiment.toUpperCase() as "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "CONCERNED",
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
