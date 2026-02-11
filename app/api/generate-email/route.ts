import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateFollowUpEmail } from "@/lib/ai-analysis";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { meetingId, tone = "professional" } = body;

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

    if (!meeting.summary) {
      return NextResponse.json(
        { error: "Meeting needs analysis before generating email" },
        { status: 400 }
      );
    }

    // Generate follow-up email
    const email = await generateFollowUpEmail({
      title: meeting.title,
      date: meeting.startedAt?.toLocaleDateString() || new Date().toLocaleDateString(),
      summary: meeting.summary,
      keyPoints: [],
      actionItems: (meeting.actionItems as Array<{ task: string; owner?: string; deadline?: string }>) || [],
      nextSteps: "Follow up on action items",
      sentiment: meeting.sentiment?.toLowerCase() || "neutral",
      tone: tone as "formal" | "casual" | "friendly",
    });

    // Save email to meeting
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { followUpEmail: email },
    });

    return NextResponse.json({
      success: true,
      email,
    });
  } catch (error) {
    console.error("Email generation error:", error);
    
    const message = error instanceof Error ? error.message : "Email generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
