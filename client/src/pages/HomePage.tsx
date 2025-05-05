import React from "react";
import { nanoid } from "nanoid";
import { Container } from "../components/Container";

import bgImage from "../assets/bg.jpg";
import { UsernameModal } from "../components/UsernameModal";
import socket from "../socket/socket";

export const HomePage = () => {
  const [showUsernameModal, setShowUsernameModal] =
    React.useState<boolean>(false);

  const createRoom = () => {
    const roomId = nanoid();
    window.open(`/canvas/${roomId}`, "_blank");

    socket.emit("create-room", { roomId });
  };

  return (
    <>
      <div
        className="h-[300px] bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <Container>
          <div className="flex items-center justify-center">
            <div className="relative w-fit leading-[202px]">
              <span className="absolute top-0 left-0 text-[96px] font-calligraphic z-0 translate-x-1 translate-y-0">
                Welcome
              </span>

              <span className="relative text-[96px] font-calligraphic text-light-text z-10">
                Welcome
              </span>
            </div>

            <div className="relative w-fit">
              <span className="absolute top-18 left-[-110px] text-[36px] z-0 translate-x-1 translate-y-0">
                to CanvasCrew
              </span>

              <span className="relative top-18 left-[-110px] text-[36px] text-light-green z-10">
                to CanvasCrew
              </span>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="flex items-center flex-col">
          <p className="mt-10">
            Create and collaborate in a fun, shared space with friends and
            others!
          </p>

          <div className="h-10"></div>

          <div className="flex items-center flex-col gap-8">
            <button
              onClick={() => setShowUsernameModal(true)}
              className="btn-dark py-4 w-[500px] text-light-text rounded-[40px] cursor-pointer"
            >
              Create new room
            </button>
            <button className="btn-light py-4 w-[500px] text-dark-text rounded-[40px] cursor-pointer">
              Create private room
            </button>
          </div>
        </div>
      </Container>

      {showUsernameModal && (
        <UsernameModal
          onHide={() => setShowUsernameModal(false)}
          createRoom={createRoom}
        />
      )}
    </>
  );
};
