import React from "react";
import { Container } from "./Container";
import { useUserStore } from "../store/user";
import socket from "../socket/socket";
import { nanoid } from "nanoid";

interface Props {
  roomId: string;
}

interface Message {
  id: string;
  text: string;
  username?: string;
  time: number;
}

export const Chat: React.FC<Props> = ({ roomId }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const username = useUserStore((state) => state.username);

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

  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("message", {
      roomId,
      id: nanoid(),
      text: input.trim(),
      username: username?.trim() || "Anonymous",
      time: Date.now(),
    });

    console.log("Sending message", { roomId, text: input, username });

    setInput("");
  };

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto"; // Сброс предыдущей высоты
      el.style.height = `${el.scrollHeight}px`; // Устанавливаем новую
    }
  };

  return (
    <Container maxWidth="" className="w-1/4 bg-chat-bg">
      <div className="h-full flex flex-col p-4">
        <div className="flex-1 overflow-y-auto mb-8 space-y-3 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white rounded-md p-2 shadow-sm relative"
            >
              <div className="font-semibold text-dark-text text-sm mb-1">
                {msg.username}
              </div>
              <div className="text-base break-words">{msg.text}</div>
              <div className="text-xs text-gray-500 absolute bottom-1 right-2">
                {new Date(msg.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 rounded-md p-2 text-black text-[16px] bg-white resize-vertical 
             min-h-[40px] max-h-[150px] overflow-y-auto 
             focus:outline-none focus:ring-2 focus:ring-green-100"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="btn-dark text-light-text text-[16px] p-2 w-[16%] rounded-md hover:bg-green-700 cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </Container>
  );
};
