"use client";

import { useState, useCallback } from "react";
import { Mic, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  onAudioChunk?: (chunk: Blob, timestamp: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: (blob: Blob | null) => void;
  onStateChange?: (isRecording: boolean, isPaused: boolean) => void;
  disabled?: boolean;
}

export function AudioRecorder({
  onAudioChunk,
  onRecordingStart,
  onRecordingStop,
  onStateChange,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState(0);

  const handleStart = useCallback(async () => {
    try {
      setError(null);
      console.log("Requesting microphone access...");

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support audio recording");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("Microphone access granted");

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") 
          ? "audio/webm" 
          : "audio/mp4",
      });

      const audioChunks: Blob[] = [];
      const start = Date.now();
      setStartTime(start);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          setChunks([...audioChunks]);
          const timestamp = Date.now() - start;
          console.log(`Chunk received: ${event.data.size} bytes at ${timestamp}ms`);
          onAudioChunk?.(event.data, timestamp);
        }
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("Recording error occurred");
      };

      recorder.onstop = () => {
        console.log("Recording stopped, total chunks:", audioChunks.length);
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording with 5 second chunks
      recorder.start(5000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setChunks([]);
      onStateChange?.(true, false);

      // Start duration timer
      const id = setInterval(() => {
        setDuration(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      setIntervalId(id);

      // Audio level monitoring
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const updateLevel = () => {
        if (!isRecording) return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(100, (avg / 128) * 100));
        requestAnimationFrame(updateLevel);
      };
      updateLevel();

      onRecordingStart?.();
      console.log("Recording started");

    } catch (err) {
      console.error("Failed to start recording:", err);
      let errorMsg = "Failed to start recording";
      
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMsg = "Microphone permission denied. Please allow access and try again.";
        } else if (err.name === "NotFoundError") {
          errorMsg = "No microphone found. Please connect a microphone.";
        } else {
          errorMsg = err.message;
        }
      }
      setError(errorMsg);
    }
  }, [onAudioChunk, onRecordingStart]);

  const handleStop = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    setIsRecording(false);
    setIsPaused(false);
    setAudioLevel(0);
    onStateChange?.(false, false);

    // Create final blob
    const blob = chunks.length > 0 
      ? new Blob(chunks, { type: mediaRecorder?.mimeType || "audio/webm" })
      : null;
    
    onRecordingStop?.(blob);
  }, [mediaRecorder, intervalId, chunks, onRecordingStop]);

  const handlePauseResume = useCallback(() => {
    if (!mediaRecorder) return;
    
    if (isPaused) {
      mediaRecorder.resume();
      setIsPaused(false);
    } else {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  }, [mediaRecorder, isPaused]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-xl bg-card">
      {/* Recording Status */}
      <div className="flex items-center gap-3">
        {isRecording && (
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPaused ? "bg-yellow-400" : "bg-red-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isPaused ? "bg-yellow-500" : "bg-red-500"
              }`}
            />
          </span>
        )}
        <span className="text-2xl font-mono font-semibold">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Audio Level Indicator */}
      {isRecording && (
        <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-75"
            style={{ width: `${audioLevel}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-500 text-center max-w-xs bg-red-50 p-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            size="lg"
            onClick={handleStart}
            disabled={disabled}
            className="gap-2 bg-red-500 hover:bg-red-600 text-white"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </Button>
        ) : (
          <>
            <Button
              size="icon"
              variant="outline"
              onClick={handlePauseResume}
              className="h-12 w-12"
            >
              {isPaused ? (
                <Play className="w-5 h-5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
            </Button>
            <Button
              size="lg"
              onClick={handleStop}
              className="gap-2"
              variant="destructive"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Status Text */}
      <p className="text-sm text-muted-foreground">
        {isRecording
          ? isPaused
            ? "Recording paused"
            : `Recording... ${chunks.length} chunks captured`
          : "Click to start recording your meeting"}
      </p>
    </div>
  );
}
