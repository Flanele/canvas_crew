import React from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";
import { Header } from "../components/Header";
import { Chat } from "../components/Chat";
import { useUserStore } from "../store/user";

export default function CanvasPage() {
  const { id } = useParams<{ id: string }>();
  const username = useUserStore((state) => state.username);

  if (!id) return <div>Room ID is missing</div>;

  React.useEffect(() => {
    if (socket && id) {
      socket.emit("join-room", { roomId: id, username: username || 'Anonymous' });
    }
  }, [socket, id]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-grow">

        {/* Левый блок */}
        <div className="w-1/4 h-[calc(100vh-62px)]">
          {/* content here */}
        </div>

        {/* Центральный блок */}
        <div className="w-1/2 bg-white h-[calc(100vh-62px)]">
          {/* content here */}
        </div>

        {/* Чат справа */}
        <div className="w-1/4 h-[calc(100vh-62px)] overflow-hidden bg-chat-bg">
          <Chat roomId={id} />
        </div>

      </div>
    </div>
  );
}
