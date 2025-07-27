import React from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";
import { Header } from "../components/Header";
import { Chat } from "../components/Chat";
import { useUserStore } from "../store/user";
import { Canvas } from "../components/Canvas";
import { ToolBar } from "../components/Toolbar";
import { CanvasOptionsBar } from "../components/CanvasOptionsBar";
import Konva from "konva";
import { useRoomSocketHandler } from "../hooks/useRoomSocketHandler";
import { UsernameModal } from "../components/UsernameModal";

export default function CanvasPage() {
  const [showUsernameModal, setShowUsernameModal] =
    React.useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
  const stageRef = React.useRef<Konva.Stage | null>(null);
  const username = useUserStore((state) => state.username);

  const { isRoomExist } = useRoomSocketHandler();

  if (!id) return <div>Room ID is missing</div>;

  React.useEffect(() => {
    if (socket && id) {
      socket.emit("join-room", {
        roomId: id,
        username: username || "Anonymous",
      });
    }
  }, [socket, id]);

  React.useEffect(() => {
    setShowUsernameModal(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <CanvasOptionsBar stageRef={stageRef} roomId={id} />

      <div className="flex flex-grow">
        {/* Левый блок */}
        <div className="w-[20%] h-[calc(100vh-92px)] bg-[#D7DBD4] border-r-1 border-border overflow-y-auto">
          <ToolBar roomId={id} />
        </div>

        {/* Центральный блок */}
        <div className="w-[60%] bg-gray-200 h-[calc(100vh-92px)]">
          <Canvas stageRef={stageRef} roomId={id} />
        </div>

        {/* Чат справа */}
        <div className="w-[20%] h-[calc(100vh-92px)] overflow-hidden bg-chat-bg border-l-1 border-border">
          <Chat roomId={id} isRoomExist={isRoomExist} />
        </div>
      </div>

      {showUsernameModal && (
        <UsernameModal
          onHide={() => setShowUsernameModal(false)}
        />
      )}
    </div>
  );
}
