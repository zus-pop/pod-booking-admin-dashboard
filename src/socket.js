import { io } from "socket.io-client";
import { toast } from "react-toastify";
let socket = null;

export const initializeSocket = (token) => {
  if (!socket) {
    const SERVER_URL = import.meta.env.VITE_API_URL;
    socket = io(SERVER_URL, {
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("connect_error", (err) => {
      console.log("Error connecting to server: ", err.message);
      if (err.message.includes("jwt expired")) {
        console.log("socket expired");
        toast.warning("Session expired! Please login again.");
        toast.warning("Session expired! Please login again.");
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }, 1000);
      }
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
