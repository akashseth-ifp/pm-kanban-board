import { Board } from "@backend/schema/board.schema";
import { fetchWithAuth } from "./helper";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/boards`;

export const getAllBoardsAPI = async (): Promise<Board[]> => {
  return fetchWithAuth(`${API_URL}`);
};

export const createBoardAPI = async (title: string): Promise<Board> => {
  return fetchWithAuth(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify({
      title,
    }),
  });
};
