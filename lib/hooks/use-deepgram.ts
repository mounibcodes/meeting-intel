"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
}

export interface TranscriptResult {
  text: string;
  words: TranscriptWord[];
  isFinal: boolean;
  confidence: number;
  speaker?: number;
}

export interface UseDeepgramOptions {
  onTranscript?: (result: TranscriptResult) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export function useDeepgram(options: UseDeepgramOptions = {}) {
  const { onTranscript, onError, onConnectionChange } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const connect = useCallback(async () => {
    try {
      // Get Deepgram config from our API
      const res = await fetch("/api/transcribe/stream");
      if (!res.ok) {
        throw new Error("Failed to get streaming config");
      }

      const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
      if (!apiKey) {
        // Fall back to mock mode if no API key
        console.warn("No Deepgram API key - using mock transcription");
        setIsConnected(true);
        onConnectionChange?.(true);
        return;
      }

      const wsUrl = new URL("wss://api.deepgram.com/v1/listen");
      wsUrl.searchParams.set("model", "nova-2");
      wsUrl.searchParams.set("language", "en-US");
      wsUrl.searchParams.set("smart_format", "true");
      wsUrl.searchParams.set("punctuate", "true");
      wsUrl.searchParams.set("diarize", "true");
      wsUrl.searchParams.set("interim_results", "true");
      wsUrl.searchParams.set("utterance_end_ms", "1000");
      wsUrl.searchParams.set("encoding", "linear16");
      wsUrl.searchParams.set("sample_rate", "16000");

      const ws = new WebSocket(wsUrl.toString(), ["token", apiKey]);

      ws.onopen = () => {
        console.log("Deepgram WebSocket connected");
        setIsConnected(true);
        setError(null);
        onConnectionChange?.(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "Results") {
            const alternative = data.channel?.alternatives?.[0];
            if (alternative && alternative.transcript) {
              const result: TranscriptResult = {
                text: alternative.transcript,
                words: alternative.words || [],
                isFinal: data.is_final || false,
                confidence: alternative.confidence || 0,
                speaker: alternative.words?.[0]?.speaker,
              };
              onTranscript?.(result);
            }
          }
        } catch (e) {
          console.error("Failed to parse Deepgram message:", e);
        }
      };

      ws.onerror = (event) => {
        console.error("Deepgram WebSocket error:", event);
        setError("Connection error");
        onError?.("Connection error");
      };

      ws.onclose = () => {
        console.log("Deepgram WebSocket closed");
        setIsConnected(false);
        onConnectionChange?.(false);
      };

      wsRef.current = ws;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Connection failed";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [onTranscript, onError, onConnectionChange]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioData);
    }
  }, []);

  // Start streaming from microphone
  const startMicrophoneStream = useCallback(async () => {
    try {
      await connect();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }
          
          wsRef.current.send(pcmData.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start microphone";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [connect, onError]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendAudio,
    startMicrophoneStream,
  };
}
