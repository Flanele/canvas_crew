import { nanoid } from "nanoid";
import socket from "../socket/socket";

interface SendMessageArgs {
    roomId: string;
    text: string;
    username?: string;
    type?: "user" | "system";
  }
  
  export const sendMessage = ({ roomId, text, username, type = "user" }: SendMessageArgs) => {
    socket.emit("message", {
      roomId,
      id: nanoid(),
      text: text.trim(),
      username: username?.trim() || "Anonymous",
      time: Date.now(),
      type,
    });
  
    console.log("Sending message", { roomId, text, username, type });
  };