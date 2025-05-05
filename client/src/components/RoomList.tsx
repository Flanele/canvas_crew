import React from "react";
import { fetchRooms } from "../api/rooms";
import socket from "../socket/socket";

interface Room {
  id: string;
  name: string;
}

export default function RoomList() {
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    socket.on("update-rooms", (updatedRooms: Room[]) => {
      console.log("Updated rooms received:", updatedRooms); 
      setRooms(updatedRooms);
    });
  
    fetchRooms()
      .then((data) => {
        console.log("Fetched rooms:", data); 
        setRooms(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load rooms");
        console.error(err);
        setLoading(false);
      });
  
    return () => {
      socket.off("update-rooms");
    };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Available Rooms</h2>
      {rooms.length === 0 ? (
        <p>No active rooms found</p>
      ) : (
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>
              <a href={`/canvas/${room.id}`}>{room.name}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
