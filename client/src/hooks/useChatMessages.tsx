
import { nanoid } from "nanoid";
import socket from "../socket/socket";
import React from "react";

interface Message {
    id: string;
    text: string;
    username?: string;
    time: number;
  }

export const useChatMessages = (roomId: string, username: string) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

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
  
  React.useEffect(() => {
    messagesEndRef.current?.scrollTo(0, messagesEndRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    socket.emit("message", {
      roomId,
      id: nanoid(),
      text: text.trim(),
      username: username?.trim() || "Anonymous",
      time: Date.now(),
    });
  };

  return { messages, sendMessage, messagesEndRef };
};
