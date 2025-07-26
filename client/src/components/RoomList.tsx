import React from "react";
import { checkPrivateIds, fetchRooms } from "../api/rooms";
import socket from "../socket/socket";
import { useRoomsStore } from "../store/rooms";
import { RoomPreview } from "./RoomPreview";
import { Container } from "./Container";

interface Room {
  id: string;
  name: string;
  preview: string;
}

export default function RoomList() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const {
    publicRooms,
    privateRooms,
    setPublicRooms,
    setPrivateRooms,
    myPrivateRoomIds,
    setMyPrivateRoomIds,
  } = useRoomsStore();
 

  React.useEffect(() => {
    const handler = (updatedRooms: Room[]) => setPublicRooms(updatedRooms);
    socket.on("update-rooms", handler);

    fetchRooms()
      .then((data) => setPublicRooms(data))
      .catch((err) => {
        setError("Failed to load rooms");
        console.error(err);
      })
      .finally(() => setLoading(false));

    return () => {
      socket.off("update-rooms", handler);
    };
  }, []);

  React.useEffect(() => {
    if (myPrivateRoomIds.length === 0) {
      setPrivateRooms([]);
      return;
    }
    setLoading(true);
    checkPrivateIds(myPrivateRoomIds)
      .then((privateRoomList) => {
        setPrivateRooms(privateRoomList);
        const actualIds = privateRoomList.map((room) => room.id);
        if (actualIds.length !== myPrivateRoomIds.length) {
          setMyPrivateRoomIds(actualIds); // чистим неактуальные
        }
      })
      .catch((err) => {
        setError("Failed to load private rooms");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [myPrivateRoomIds, setPrivateRooms, setMyPrivateRoomIds]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container>
      {publicRooms.length > 0 ? (
        <>
          <h2 className="text-center mt-4 mb-6 text-[18px]">Available Public Rooms</h2>
          <ul className="flex flex-wrap gap-x-28 justify-center">
            {publicRooms.map((room) => (
              <li
                key={room.id}
                className="flex flex-col items-center mb-6 w-48"
              >
                <RoomPreview room={room} />
                <a
                  className="text-[16px] mt-2 text-center block hover:text-green-900"
                  href={`/canvas/${room.id}`}
                >
                  {room.name}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-[18px] text-center mt-4 mb-6">
          There are no active rooms yet. Be the first to create one!
        </p>
      )}
  
      {privateRooms.length > 0 && (
        <>
          <h2 className="text-center mt-4 mb-6 text-[18px]">Your Private Rooms</h2>
          <ul className="flex flex-wrap gap-x-28 justify-center">
            {privateRooms.map((room) => (
              <li
                key={room.id}
                className="flex flex-col items-center mb-6 w-48"
              >
                <RoomPreview room={room} />
                <a
                  className="text-[16px] mt-2 text-center block hover:text-green-900"
                  href={`/canvas/${room.id}`}
                >
                  {room.name}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </Container>
  );
  
  
}
