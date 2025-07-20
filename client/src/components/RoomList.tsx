import React from "react";
import { checkPrivateIds, fetchRooms } from "../api/rooms";
import socket from "../socket/socket";
import { useRoomsStore } from "../store/rooms";

interface Room {
  id: string;
  name: string;
}

export default function RoomList() {
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [privateRooms, setPrivateRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const privateRoomIds = useRoomsStore((s) => s.privateRoomIds);
  const setPrivateRoomIds = useRoomsStore((s) => s.setPrivateRoomIds);

  React.useEffect(() => {
    const handler = (updatedRooms: Room[]) => setRooms(updatedRooms);
    socket.on("update-rooms", handler);

    fetchRooms()
      .then((data) => setRooms(data))
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
    if (privateRoomIds.length === 0) {
      setPrivateRooms([]);
      return;
    }
    setLoading(true);
    checkPrivateIds(privateRoomIds)
      .then((privateRoomList) => {
        setPrivateRooms(privateRoomList);
        const actualIds = privateRoomList.map((room) => room.id);
        if (actualIds.length !== privateRoomIds.length) {
          setPrivateRoomIds(actualIds); // чистим неактуальные
        }
      })
      .catch((err) => {
        setError("Failed to load private rooms");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [privateRoomIds, setPrivateRoomIds]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Available Public Rooms</h2>
      {rooms.length === 0 ? (
        <p>No public rooms found</p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>
              <a href={`/canvas/${room.id}`}>{room.name}</a>
            </li>
          ))}
        </ul>
      )}

      {privateRooms.length > 0 && (
        <>
          <h2 className="mt-8">Your Private Rooms</h2>
          <ul>
            {privateRooms.map((room) => (
              <li key={room.id}>
                <a href={`/canvas/${room.id}`}>{room.name}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
