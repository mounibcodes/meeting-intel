import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import prisma from "./prisma";

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a meeting room
    socket.on("join-meeting", async ({ meetingId }) => {
      socket.join(meetingId);
      console.log(`Socket ${socket.id} joined meeting ${meetingId}`);
    });

    // Start a new meeting
    socket.on("start-meeting", async ({ title, userId }) => {
      try {
        const meeting = await prisma.meeting.create({
          data: {
            title: title || "Untitled Meeting",
            userId,
            status: "IN_PROGRESS",
            startedAt: new Date(),
            audioUrls: [],
          },
        });

        socket.join(meeting.id);
        socket.emit("meeting-started", { meetingId: meeting.id });
        
        console.log(`Meeting started: ${meeting.id}`);
      } catch (error) {
        console.error("Failed to create meeting:", error);
        socket.emit("error", "Failed to create meeting");
      }
    });

    // Handle audio chunk
    socket.on("audio-chunk", async ({ meetingId, audio, timestamp }) => {
      try {
        // Here you would:
        // 1. Save the audio chunk to storage (S3, etc.)
        // 2. Send to transcription service (Deepgram, etc.)
        // 3. Broadcast transcript back to client

        // For now, emit a placeholder transcript
        socket.emit("transcript", {
          text: "Transcription will appear here when Deepgram is integrated...",
          timestamp,
          isFinal: false,
          confidence: 0,
        });
      } catch (error) {
        console.error("Failed to process audio chunk:", error);
      }
    });

    // Stop meeting
    socket.on("stop-meeting", async ({ meetingId }) => {
      try {
        await prisma.meeting.update({
          where: { id: meetingId },
          data: {
            status: "PROCESSING",
            endedAt: new Date(),
          },
        });

        io?.to(meetingId).emit("meeting-status", "PROCESSING");
        console.log(`Meeting stopped: ${meetingId}`);

        // Here you would trigger AI analysis
      } catch (error) {
        console.error("Failed to stop meeting:", error);
        socket.emit("error", "Failed to stop meeting");
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}
