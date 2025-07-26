import React from "react";
import socket from "../socket/socket";
import { useRoomsStore } from "../store/rooms";
import { Paintbrush } from "lucide-react";

interface Props {
  room: {
    id: string;
    name: string;
    preview: string;
  };
}

export const RoomPreview: React.FC<Props> = ({ room }) => {
  const preview = useRoomsStore(
    (s) =>
      s.publicRooms.find((r) => r.id === room.id)?.preview ||
      s.privateRooms.find((r) => r.id === room.id)?.preview ||
      ""
  );

  const updatePrewiev = useRoomsStore((s) => s.updateRoomPreview);

  React.useEffect(() => {
    const handler = ({
      roomId: incomingId,
      preview,
    }: {
      roomId: string;
      preview: string;
    }) => {
      if (incomingId === room.id) {
        updatePrewiev(room.id, preview);
      }
    };
    socket.on("update-room-preview", handler);
    return () => {
      socket.off("update-room-preview", handler);
    };
  }, [room.id]);

  return (
    <div className="w-68 h-44 flex items-center justify-center bg-white rounded-lg">
      {preview ? (
        <img
          className="w-full h-full rounded-lg object-contain"
          src={preview}
          alt="Room preview"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200">
          <Paintbrush className="w-10 h-10 text-gray-300 mb-2" />
          <span className="text-gray-400 text-[14px]">No drawing yet</span>
        </div>
      )}
    </div>
  );
};
