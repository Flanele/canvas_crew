import { axiosInstance } from "./instance/axiosInstance";

interface Room {
  id: string;
  name: string;
}

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await axiosInstance.get<Room[]>("/api/rooms");
  return response.data;
};

export const checkPrivateIds = async (ids: string[]): Promise<Room[]> => {
  const response = await axiosInstance.post<Room[]>(
    "/api/rooms/check",
    { ids },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};
