import { nanoid } from "nanoid";
import { Container } from "../components/Container";

import bgImage from "../assets/bg.jpg";
import socket from "../socket/socket";
import RoomList from "../components/RoomList";
import { useRoomsStore } from "../store/rooms";

export const HomePage = () => {
  const addMyPrivateRoomId = useRoomsStore((s) => s.addMyPrivateRoomId);

  const createRoom = (isPrivate: boolean) => {
    const roomId = nanoid();
    if (isPrivate) {
      addMyPrivateRoomId(roomId);
    }
    window.open(`/canvas/${roomId}`, "_blank");
    socket.emit("create-room", { roomId, isPrivate });
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
        <div className="flex items-center flex-col pb-20">
          <p className="mt-10">
            Create and collaborate in a fun, shared space with friends and
            others!
          </p>

          <div className="p-10">
            <RoomList />
          </div>

          <div className="flex items-center flex-col gap-8">
            <button
              onClick={() => {
                createRoom(false);
              }}
              className="btn-dark py-4 w-[500px] text-light-text rounded-[40px] cursor-pointer"
            >
              Create new room
            </button>
            <button
              onClick={() => {
                createRoom(true);
              }}
              className="btn-light py-4 w-[500px] text-dark-text rounded-[40px] cursor-pointer"
            >
              Create private room
            </button>
          </div>
        </div>
      </Container>
    </>
  );
};
