import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RoomStore {
  privateRoomIds: string[];
  addPrivateRoomId: (id: string) => void;
  setPrivateRoomIds: (ids: string[]) => void;
}

export const useRoomsStore = create<RoomStore>()(
  persist(
    (set) => ({
      privateRoomIds: [],
      addPrivateRoomId: (id) =>
        set((state) =>
          state.privateRoomIds.includes(id)
            ? {}
            : { privateRoomIds: [...state.privateRoomIds, id] }
        ),
      setPrivateRoomIds: (ids) => set({ privateRoomIds: ids }),
    }),
    {
      name: "myPrivateRooms",
    }
  )
);

  
