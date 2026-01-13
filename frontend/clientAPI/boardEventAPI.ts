import { fetchWithAuth } from "./helper";
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/event`;
import {
  UpdateBoardEvent,
  UpdateBoardEventResponse,
} from "@backend/boardEvents/updateBoard.event";
import {
  DeleteBoardEvent,
  DeleteBoardEventResponse,
} from "@backend/boardEvents/deleteBoard.event";
import {
  GetBoardEvent,
  GetBoardEventResponse,
} from "@backend/boardEvents/getBoard.event";

export const getBoardAPI = async (
  data: Omit<GetBoardEvent, "eventType">
): Promise<GetBoardEventResponse> => {
  return fetchWithAuth(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify({ eventType: "GET_BOARD", ...data }),
  });
};

export const updateBoardAPI = async (
  data: Omit<UpdateBoardEvent, "eventType" | "version">
): Promise<UpdateBoardEventResponse> => {
  try {
    const resData: UpdateBoardEventResponse = await fetchWithAuth(
      `${API_URL}`,
      {
        method: "POST",
        body: JSON.stringify({
          eventType: "UPDATE_BOARD",
          version: 0,
          ...data,
        }),
      }
    );
    return resData;
  } catch (error) {
    throw error;
  }
};

export const deleteBoardAPI = async (
  data: Omit<DeleteBoardEvent, "eventType">
): Promise<DeleteBoardEventResponse> => {
  try {
    const resData: DeleteBoardEventResponse = await fetchWithAuth(
      `${API_URL}`,
      {
        method: "POST",
        body: JSON.stringify({ eventType: "DELETE_BOARD", ...data }),
      }
    );
    return resData;
  } catch (error) {
    throw error;
  }
};
