import { Board } from "@backend/schema/board.schema";
import { fetchWithAuth } from "./helper";
import { BoardEvent } from "@backend/schema/board-events.schema";

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

// Fetch single board with table row
export const getBoardAPI = async (boardId: string): Promise<Board> => {
  return fetchWithAuth(`${API_URL}/${boardId}`);
};

export const getBoardEventsAPI = async (
  boardId: string,
  fromVersion: number
): Promise<BoardEvent[]> => {
  return fetchWithAuth(
    `${API_URL}/${boardId}/events?from_version=${fromVersion}`
  );
};
