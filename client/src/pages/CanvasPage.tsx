import React from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";
import { Header } from "../components/Header";
import { Chat } from "../components/Chat";
import { useUserStore } from "../store/user";
import { Canvas } from "../components/Canvas";
import { ToolBar } from "../components/Toolbar";

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
        <div className="w-[20%] h-[calc(100vh-62px)] border-r-1 border-border">
          <ToolBar roomId={id} />
        </div>

        {/* Центральный блок */}
        <div className="w-[60%] bg-gray-200 h-[calc(100vh-62px)]">
          <Canvas roomId={id} />
        </div>

        {/* Чат справа */}
        <div className="w-[20%] h-[calc(100vh-62px)] overflow-hidden bg-chat-bg border-l-1 border-border">
          <Chat roomId={id} />
        </div>

      </div>
    </div>
  );
}
