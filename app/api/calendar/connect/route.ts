import { NextResponse } from "next/server";

// This route initiates Google OAuth flow
// You'll need to set up Google Cloud Console project and OAuth credentials

export async function GET() {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`;
  
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: "Google Calendar not configured. Add GOOGLE_CLIENT_ID to .env" },
      { status: 503 }
    );
  }

  const scope = encodeURIComponent("https://www.googleapis.com/auth/calendar.readonly");
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` +
    `&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
