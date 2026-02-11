"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, Square, Pause, Play, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MiniRecorderPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "saving">("idle");
  const [chunks, setChunks] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });

      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          setChunks(audioChunksRef.current.length);
        }
      };

      recorder.start(5000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setStatus("recording");

      // Create meeting in database
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Meeting ${new Date().toLocaleString()}` }),
      });
      if (res.ok) {
        const data = await res.json();
        setMeetingId(data.id);
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Could not access microphone");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRecording(false);
    setIsPaused(false);
    setStatus("saving");

    // Save recording
    if (meetingId && audioChunksRef.current.length > 0) {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        let transcript = "";
        if (transcribeRes.ok) {
          const data = await transcribeRes.json();
          transcript = data.transcript || "";
        }

        // Update meeting
        await fetch(`/api/meetings/${meetingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "PROCESSING",
            duration,
            transcript,
          }),
        });

        // Trigger analysis
        if (transcript.length >= 50) {
          await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ meetingId, transcript }),
          });
        }

        // Open meeting detail in main window
        window.opener?.postMessage({ type: "meeting-complete", meetingId }, "*");
        
      } catch (error) {
        console.error("Failed to save:", error);
      }
    }

    setStatus("idle");
    setDuration(0);
    setChunks(0);
    setMeetingId(null);
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const closeWindow = () => {
    if (isRecording) {
      if (confirm("Recording in progress. Stop and close?")) {
        stopRecording().then(() => window.close());
      }
    } else {
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">MeetingIntel</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-white"
          onClick={closeWindow}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Timer */}
        <div className="text-5xl font-mono font-bold mb-2">
          {formatDuration(duration)}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-6">
          {isRecording && (
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPaused ? "bg-yellow-400" : "bg-red-400"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? "bg-yellow-500" : "bg-red-500"}`} />
            </span>
          )}
          <span className="text-sm text-gray-400">
            {status === "idle" && "Ready to record"}
            {status === "recording" && (isPaused ? "Paused" : `Recording • ${chunks} chunks`)}
            {status === "saving" && "Saving..."}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button
              size="lg"
              className="bg-red-500 hover:bg-red-600 rounded-full h-16 w-16"
              onClick={startRecording}
              disabled={status === "saving"}
            >
              <Mic className="w-6 h-6" />
            </Button>
          ) : (
            <>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-12 w-12 border-gray-600"
                onClick={togglePause}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button
                size="lg"
                className="bg-red-500 hover:bg-red-600 rounded-full h-16 w-16"
                onClick={stopRecording}
              >
                <Square className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        {meetingId && (
          <p>Meeting ID: {meetingId.slice(0, 8)}...</p>
        )}
      </div>
    </div>
  );
}
