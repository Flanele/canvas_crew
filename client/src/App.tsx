import React from "react";
import { AppRouter } from "./router/AppRouter";
import socket from "./socket/socket";

function App() {
  React.useEffect(() => {
    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

  }, []);

  return (
    <main>
      <AppRouter />
    </main>
  );
}

export default App;
