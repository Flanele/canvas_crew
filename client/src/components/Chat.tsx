import React from "react";
import { useUserStore } from "../store/user";
import { sendMessage } from "../lib/sendMessage";
import { useChatMessages } from "../hooks/useChatMessages";
import { useScrollToBottom } from "../hooks/useScrollToBottom";
import { Link } from "react-router-dom";
import socket from "../socket/socket";

interface Props {
  roomId: string;
  isRoomExist: boolean;
}

export const Chat: React.FC<Props> = ({ roomId, isRoomExist }) => {
  const { messages } = useChatMessages(roomId);
  const [input, setInput] = React.useState("");
  const username = useUserStore((state) => state.username);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useScrollToBottom(messagesEndRef, [messages]);

  React.useEffect(() => {
    if (socket && isRoomExist && roomId) {
      socket.emit("load-messages", { roomId });
    }
  }, [roomId, isRoomExist]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 1000) {
      setInput(e.target.value);
    }

    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto"; // Сброс предыдущей высоты
      el.style.height = `${el.scrollHeight}px`; // Устанавливаем новую
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    sendMessage({ roomId, text: input, username, type: "user" });

    setInput("");
  };

  return (
    <div className="h-full flex flex-col p-4">
      {!isRoomExist && (
        <div className="mb-4 p-3 rounded-md bg-yellow-100 text-yellow-900 border border-yellow-400 text-sm text-center font-medium">
          <strong>Warning!</strong> This room does not exist in the list of
          registered rooms.
          <br />
          You can continue drawing, but other users will not see your changes or
          messages in real time.
          <br />
          If you want to create a collaborative room, please go back to the{" "}
          <Link to="/" className="underline text-green-700">Home page</Link>
          .
        </div>
      )}
      <div
        className="flex-1 overflow-y-auto mb-8 space-y-3 pr-1"
        ref={messagesEndRef}
      >
        {messages.map((msg) =>
          msg.type === "system" ? (
            <div
              key={msg.id}
              className="text-center text-dark-text text-sm italic"
            >
              {msg.text}
            </div>
          ) : (
            <div
              key={msg.id}
              className="bg-white rounded-md p-2 shadow-sm relative"
            >
              <div className="font-semibold text-dark-text text-sm mb-1">
                {msg.username}
              </div>
              <div className="text-base break-words mb-2">{msg.text}</div>
              <div className="text-xs text-gray-500 absolute bottom-1 right-2">
                {new Date(msg.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          )
        )}
      </div>

      <div className="flex gap-2 flex-col">
        <div className=" flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 rounded-md p-2 text-black text-[16px] bg-white resize-vertical 
             min-h-[60px] max-h-[150px] overflow-y-auto 
             focus:outline-none focus:ring-2 focus:ring-green-100"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="btn-dark text-light-text text-[16px] p-2 w-[16%] rounded-md hover:bg-green-700 cursor-pointer"
          >
            Send
          </button>
        </div>
        <div className="self-end pr-20 text-[12px]">
          <span>{input.length} / 1000</span>
        </div>
      </div>
    </div>
  );
};
