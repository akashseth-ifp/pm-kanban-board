import { io } from "socket.io-client";

// Point this to your backend URL
const URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export const socket = io(URL, {
  autoConnect: true, // Connects immediately
});
