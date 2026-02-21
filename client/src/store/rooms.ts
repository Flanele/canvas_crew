import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Room {
  id: string;
  name: string;
  preview: string;
}

interface RoomStore {
  publicRooms: Room[];
  privateRooms: Room[];   
  myPrivateRoomIds: string[]; 
  setPublicRooms: (rooms: Room[]) => void;
  setPrivateRooms: (rooms: Room[]) => void;
  setMyPrivateRoomIds: (ids: string[]) => void;
  addMyPrivateRoomId: (id: string) => void;
  updateRoomPreview: (roomId: string, preview: string) => void;
}

export const useRoomsStore = create<RoomStore>()(
  persist(
    (set) => ({
      publicRooms: [],
      privateRooms: [],
      myPrivateRoomIds: [],
      setPublicRooms: (rooms) => set({ publicRooms: rooms }),
      setPrivateRooms: (rooms) => set({ privateRooms: rooms }),
      setMyPrivateRoomIds: (ids) => set({ myPrivateRoomIds: ids }),
      addMyPrivateRoomId: (id) =>
        set((state) =>
          state.myPrivateRoomIds.includes(id)
            ? {}
            : { myPrivateRoomIds: [...state.myPrivateRoomIds, id] }
        ),
      updateRoomPreview: (roomId, preview) =>
        set((state) => ({
          publicRooms: state.publicRooms.map((room) =>
            room.id === roomId ? { ...room, preview } : room
          ),
          privateRooms: state.privateRooms.map((room) =>
            room.id === roomId ? { ...room, preview } : room
          ),
        })),
    }),
    { name: "roomsStore" }
  )
);
  
