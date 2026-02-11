"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface TranscriptChunk {
  id: string;
  text: string;
  speaker?: number;
  timestamp: number;
  isFinal: boolean;
}

interface LiveTranscriptProps {
  chunks: TranscriptChunk[];
  isRecording?: boolean;
}

const SPEAKER_COLORS = [
  "text-blue-600",
  "text-green-600",
  "text-purple-600",
  "text-orange-600",
  "text-pink-600",
];

export function LiveTranscript({ chunks, isRecording = false }: LiveTranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new chunks arrive
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chunks, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  const formatTimestamp = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = useCallback(() => {
    const text = chunks
      .filter((c) => c.isFinal)
      .map((c) => c.text)
      .join(" ");
    navigator.clipboard.writeText(text);
  }, [chunks]);

  if (chunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground">
          {isRecording
            ? "Listening... Transcript will appear here."
            : "Start recording to see the transcript."}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <h3 className="font-semibold text-sm">Live Transcript</h3>
        <button
          onClick={copyToClipboard}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Copy All
        </button>
      </div>

      {/* Transcript Content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-80 overflow-y-auto p-4 space-y-3"
      >
        {chunks.map((chunk) => (
          <div
            key={chunk.id}
            className={`flex gap-3 ${!chunk.isFinal ? "opacity-60" : ""}`}
          >
            <span className="text-xs text-muted-foreground font-mono min-w-[48px]">
              {formatTimestamp(chunk.timestamp)}
            </span>
            <div className="flex-1">
              {chunk.speaker !== undefined && (
                <span
                  className={`text-xs font-medium ${
                    SPEAKER_COLORS[chunk.speaker % SPEAKER_COLORS.length]
                  }`}
                >
                  Speaker {chunk.speaker + 1}:{" "}
                </span>
              )}
              <span className={chunk.isFinal ? "" : "italic"}>
                {chunk.text}
              </span>
            </div>
          </div>
        ))}

        {/* Scroll indicator */}
        {!autoScroll && (
          <button
            onClick={() => {
              setAutoScroll(true);
              if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
              }
            }}
            className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm shadow-lg"
          >
            ↓ New transcript
          </button>
        )}
      </div>
    </div>
  );
}
