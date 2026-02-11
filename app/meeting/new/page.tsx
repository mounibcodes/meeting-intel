"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { LiveTranscript } from "@/components/audio/live-transcript";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface TranscriptChunk {
  id: string;
  text: string;
  speaker?: number;
  timestamp: number;
  isFinal: boolean;
}

export default function NewMeetingPage() {
  const router = useRouter();
  const [meetingTitle, setMeetingTitle] = useState("Untitled Meeting");
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transcriptChunks, setTranscriptChunks] = useState<TranscriptChunk[]>([]);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [fullTranscript, setFullTranscript] = useState("");
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  // Accumulate transcript
  useEffect(() => {
    const finalChunks = transcriptChunks.filter(c => c.isFinal);
    setFullTranscript(finalChunks.map(c => c.text).join(" "));
  }, [transcriptChunks]);

  const handleAudioChunk = useCallback(async (chunk: Blob, timestamp: number) => {
    audioChunksRef.current.push(chunk);
    console.log(`Audio chunk ${audioChunksRef.current.length}: ${chunk.size} bytes`);
    
    // Send chunk to Deepgram for transcription
    try {
      const formData = new FormData();
      formData.append("audio", chunk, "chunk.webm");
      
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.transcript && data.transcript.trim()) {
          const transcriptChunk: TranscriptChunk = {
            id: `chunk-${Date.now()}`,
            text: data.transcript,
            timestamp,
            isFinal: true,
          };
          setTranscriptChunks((prev) => [...prev, transcriptChunk]);
          console.log("Transcription:", data.transcript);
        } else {
          console.log("No speech detected in chunk");
        }
      } else {
        const error = await res.text();
        console.error("Transcription failed:", error);
        // Show fallback message
        setTranscriptChunks((prev) => [...prev, {
          id: `chunk-${Date.now()}`,
          text: `[${Math.floor(timestamp / 1000)}s] Audio captured (transcription pending...)`,
          timestamp,
          isFinal: false,
        }]);
      }
    } catch (error) {
      console.error("Failed to transcribe chunk:", error);
    }
  }, []);

  const handleRecordingStart = useCallback(async () => {
    console.log("Recording started callback");
    setTranscriptChunks([]);
    audioChunksRef.current = [];
    startTimeRef.current = Date.now();
    
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: meetingTitle }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMeetingId(data.id);
        console.log("Meeting created:", data.id);
      } else {
        console.error("Failed to create meeting:", await res.text());
      }
    } catch (error) {
      console.error("Failed to create meeting:", error);
    }
  }, [meetingTitle]);

  const handleStateChange = useCallback((recording: boolean, paused: boolean) => {
    console.log("State changed - recording:", recording, "paused:", paused);
    setIsRecording(recording);
  }, []);

  const handleRecordingStop = useCallback(async () => {
    setIsRecording(false);
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    if (meetingId && audioChunksRef.current.length > 0) {
      setIsSaving(true);
      
      try {
        // Combine all audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        // Send for transcription if we have audio
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("meetingId", meetingId);

        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        let transcript = fullTranscript;
        if (transcribeRes.ok) {
          const transcriptData = await transcribeRes.json();
          transcript = transcriptData.transcript || fullTranscript;
        }

        // Update meeting with transcript and duration
        await fetch(`/api/meetings/${meetingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: "PROCESSING",
            duration,
            transcript,
          }),
        });

        // Trigger AI analysis if transcript is long enough
        if (transcript && transcript.length >= 50) {
          console.log("Starting AI analysis...");
          const analyzeRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ meetingId, transcript }),
          });

          if (analyzeRes.ok) {
            console.log("Analysis complete!");
          } else {
            console.error("Analysis failed:", await analyzeRes.text());
          }
        }
      } catch (error) {
        console.error("Failed to process recording:", error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [meetingId, fullTranscript]);

  const handleSaveAndView = useCallback(async () => {
    if (meetingId) {
      router.push(`/dashboard`);
    }
  }, [meetingId, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 flex-1"
          placeholder="Meeting title..."
          disabled={isRecording}
        />
      </div>

      <div className="grid gap-6">
        <AudioRecorder
          onAudioChunk={handleAudioChunk}
          onRecordingStart={handleRecordingStart}
          onRecordingStop={handleRecordingStop}
          onStateChange={handleStateChange}
          disabled={isSaving}
        />

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>💡 Tip:</strong> Add your Deepgram API key to <code>.env.local</code> for real-time transcription.
          Get a free key at <a href="https://deepgram.com" target="_blank" className="underline">deepgram.com</a>
        </div>

        <LiveTranscript 
          chunks={transcriptChunks} 
          isRecording={isRecording} 
        />

        {!isRecording && transcriptChunks.length > 0 && (
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              disabled={isSaving}
            >
              Discard
            </Button>
            <Button 
              onClick={handleSaveAndView}
              className="gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save & View
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
