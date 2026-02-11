import { Server as SocketIOServer } from "socket.io";
import { NextResponse } from "next/server";

declare global {
  var io: SocketIOServer | undefined;
}

export async function GET() {
  return NextResponse.json({ 
    message: "Socket.IO endpoint - requires custom server setup",
    status: "ready"
  });
}
