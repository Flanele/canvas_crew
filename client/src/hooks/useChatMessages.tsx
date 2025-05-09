import React from "react";
import socket from "../socket/socket";

export interface Message {
  id: string;
  text: string;
  username?: string;
  time: number;
  type?: "user" | "system";
}

interface UseChatMessagesReturn {
  messages: Message[];
}

export const useChatMessages = (): UseChatMessagesReturn => {
  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    const handleMessage = (message: Message) => {
      console.log("📩 Received message:", message);

      const username = message.username?.trim() || "Anonymous";
      const processedMessage = { ...message, username };
      setMessages((prev) => [...prev, processedMessage]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, []);

  return { messages };
};
