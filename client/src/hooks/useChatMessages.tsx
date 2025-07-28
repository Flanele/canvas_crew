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

export const useChatMessages = (roomId: string): UseChatMessagesReturn => {
  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    const handleMessage = (message: Message) => {
      console.log("📩 Received message:", message);

      const username = message.username?.trim() || "Anonymous";
      const processedMessage = { ...message, username };
      setMessages((prev) => [...prev, processedMessage]);
    };

    const handleChatHistory = ({
      roomId: incomingRoomId,
      history,
    }: {
      roomId: string;
      history: Message[];
    }) => {
      if (incomingRoomId !== roomId) return;
      setMessages(
        history.map((msg) => ({
          ...msg,
          username: msg.username?.trim() || "Anonymous",
        }))
      );
    };

    socket.on("message", handleMessage);
    socket.on("load-messages", handleChatHistory);

    return () => {
      socket.off("message", handleMessage);
      socket.off("load-messages", handleChatHistory);
    };
  }, [roomId]);

  return { messages };
};
