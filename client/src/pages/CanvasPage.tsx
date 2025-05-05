import React from "react";
import { Link, useParams } from "react-router-dom"
import socket from "../socket/socket";
import { Chat } from "../components/Chat";

export default function CanvasPage() {
    const { id } = useParams<{ id: string }>();

    if (!id) return <div>Room ID is missing</div>;
  
    React.useEffect(() => {
      if (socket && id) {
        socket.emit("join-room", { roomId: id }); 
      }
    }, [socket, id]);
    

    return (
      <div>
        Draaaw
        <div>
          <Link to="/">Home</Link>
        </div>
        <Chat roomId={id} />
      </div>
    );
  }