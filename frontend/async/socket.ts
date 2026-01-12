import { io, Socket } from "socket.io-client";

// Point this to your backend URL
const URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

// Standard Next.js singleton pattern for development to prevent multiple connections during HMR
const globalForSocket = globalThis as unknown as { socket: Socket | undefined };

export const socket =
  globalForSocket.socket ??
  io(URL, {
    autoConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForSocket.socket = socket;
}
