import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  username: string;
  setUsername: (username: string) => void;
}

export const useUserStore = create<State>()(
  persist(
    (set) => ({
      username: "",
      setUsername: (username: string) => set({ username }),
    }),
    {
      name: "user-storage",
    }
  )
);
