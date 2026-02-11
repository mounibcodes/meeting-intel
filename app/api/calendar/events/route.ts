import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Demo mock events - in production, call Google Calendar API
    const now = new Date();
    const mockEvents = [
      {
        id: "1",
        title: "Team Standup",
        start: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
        meetingLink: "https://meet.google.com/abc-defg-hij",
        platform: "Google Meet",
      },
      {
        id: "2", 
        title: "Client Call - Acme Corp",
        start: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        meetingLink: "https://zoom.us/j/123456789",
        platform: "Zoom",
      },
      {
        id: "3",
        title: "Product Review",
        start: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        end: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
        meetingLink: "https://teams.microsoft.com/meeting/xyz",
        platform: "Microsoft Teams",
      },
    ];

    return NextResponse.json({ events: mockEvents });
  } catch (error) {
    console.error("Calendar events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
