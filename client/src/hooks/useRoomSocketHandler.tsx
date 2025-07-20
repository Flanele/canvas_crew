import React from "react";
import socket from "../socket/socket";

export const useRoomSocketHandler = () => {
    const [isRoomExist, setIsRoomExist] = React.useState(true);
  
    React.useEffect(() => {
      const roomNotFoundHandler = () => {
        setIsRoomExist(false);
      };
  
      socket.on("room-not-found", roomNotFoundHandler);
  
      return () => {
        socket.off("room-not-found", roomNotFoundHandler);
      };
    }, []);
  
    return { isRoomExist };
  };