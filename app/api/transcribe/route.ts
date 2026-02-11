import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const meetingId = formData.get("meetingId") as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const deepgram = createClient(apiKey);
    const audioBuffer = await audioFile.arrayBuffer();

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      Buffer.from(audioBuffer),
      {
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        punctuate: true,
        diarize: true,
        paragraphs: true,
        utterances: true,
      }
    );

    if (error) {
      console.error("Deepgram transcription error:", error);
      return NextResponse.json(
        { error: "Transcription failed" },
        { status: 500 }
      );
    }

    const transcript = result?.results?.channels?.[0]?.alternatives?.[0];

    return NextResponse.json({
      meetingId,
      transcript: transcript?.transcript || "",
      words: transcript?.words || [],
      paragraphs: transcript?.paragraphs?.paragraphs || [],
      confidence: transcript?.confidence || 0,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to process transcription" },
      { status: 500 }
    );
  }
}
