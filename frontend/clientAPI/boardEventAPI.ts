import { Board } from "@backend/schema/board.schema";
import { List } from "@backend/schema/list.schema";
import { Ticket } from "@backend/schema/ticket.schema";
import { fetchWithAuth } from "./helper";
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/event`;
import { AddBoardEvent } from "@backend/boardEvents/addBoard.event";
import { UpdateBoardEvent } from "@backend/boardEvents/updateBoard.event";
import { DeleteBoardEvent } from "@backend/boardEvents/deleteBoard.event";
import { GetBoardEvent } from "@backend/boardEvents/getBoard.event";

export const addBoardAPI = async (
  data: Omit<AddBoardEvent, "eventType">
): Promise<Board> => {
  return fetchWithAuth(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify({ eventType: "ADD_BOARD", ...data }),
  });
};

export const getBoardAPI = async (
  data: Omit<GetBoardEvent, "eventType">
): Promise<{ board: Board; lists: List[]; tickets: Ticket[] }> => {
  return fetchWithAuth(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify({ eventType: "GET_BOARD", ...data }),
  });
};

export const updateBoardAPI = async (
  data: Omit<UpdateBoardEvent, "eventType" | "version">
): Promise<Board> => {
  try {
    const { newVersion, data: resData } = await fetchWithAuth(`${API_URL}`, {
      method: "POST",
      body: JSON.stringify({ eventType: "UPDATE_BOARD", version: 0, ...data }),
    });
    return resData;
  } catch (error) {
    throw error;
  }
};

export const deleteBoardAPI = async (
  data: Omit<DeleteBoardEvent, "eventType">
): Promise<void> => {
  return fetchWithAuth(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify({ eventType: "DELETE_BOARD", ...data }),
  });
};
