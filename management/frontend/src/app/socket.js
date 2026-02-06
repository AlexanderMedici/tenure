import { io } from "socket.io-client";

let socket;
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const SOCKET_BASE =
  import.meta.env.VITE_SOCKET_URL || API_BASE || "http://localhost:5000";

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_BASE, {
      withCredentials: true,
    });
  }
  return socket;
};
