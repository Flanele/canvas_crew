import { axiosInstance } from "./instance/axiosInstance";

interface Room {
  id: string;
  name: string;
}

export const fetchRooms = async (): Promise<Room[]> => {
  const response = await axiosInstance.get<Room[]>("/api/rooms");
  return response.data;
};
