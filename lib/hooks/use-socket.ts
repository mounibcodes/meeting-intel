"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface UseSocketOptions {
  meetingId?: string;
  onTranscript?: (data: TranscriptData) => void;
  onStatusChange?: (status: string) => void;
  onError?: (error: string) => void;
}

export interface TranscriptData {
  text: string;
  speaker?: number;
  timestamp: number;
  isFinal: boolean;
  confidence: number;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { meetingId, onTranscript, onStatusChange, onError } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      path: "/api/socket",
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
      if (meetingId) {
        socket.emit("join-meeting", { meetingId });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      setConnectionError(error.message);
      onError?.(error.message);
    });

    socket.on("transcript", (data: TranscriptData) => {
      onTranscript?.(data);
    });

    socket.on("meeting-status", (status: string) => {
      onStatusChange?.(status);
    });

    socket.on("error", (error: string) => {
      onError?.(error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [meetingId, onTranscript, onStatusChange, onError]);

  const sendAudioChunk = useCallback((chunk: Blob, timestamp: number) => {
    if (socketRef.current?.connected && meetingId) {
      chunk.arrayBuffer().then((buffer) => {
        socketRef.current?.emit("audio-chunk", {
          meetingId,
          audio: buffer,
          timestamp,
        });
      });
    }
  }, [meetingId]);

  const startMeeting = useCallback((title: string) => {
    return new Promise<string>((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      socketRef.current.emit("start-meeting", { title });
      
      socketRef.current.once("meeting-started", (data: { meetingId: string }) => {
        resolve(data.meetingId);
      });

      socketRef.current.once("error", (error: string) => {
        reject(new Error(error));
      });
    });
  }, []);

  const stopMeeting = useCallback(() => {
    if (socketRef.current?.connected && meetingId) {
      socketRef.current.emit("stop-meeting", { meetingId });
    }
  }, [meetingId]);

  return {
    isConnected,
    connectionError,
    sendAudioChunk,
    startMeeting,
    stopMeeting,
  };
}
