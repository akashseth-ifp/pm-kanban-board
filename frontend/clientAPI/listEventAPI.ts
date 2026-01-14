import { List } from "@backend/schema/list.schema";
import { fetchWithAuth } from "./helper";
import {
  AddListEvent,
  AddListEventResponse,
} from "@backend/boardEvents/addList.event";
import {
  UpdateListEvent,
  UpdateListEventResponse,
} from "@backend/boardEvents/updateList.event";
import {
  DeleteListEvent,
  DeleteListEventResponse,
} from "@backend/boardEvents/deleteList.event";
import {
  UpdateListPositionEvent,
  UpdateListPositionEventResponse,
} from "@backend/boardEvents/updateListPosition.event";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/event`;

export const addListAPI = async (
  data: Omit<AddListEvent, "eventType">
): Promise<AddListEventResponse> => {
  try {
    const resData = await fetchWithAuth(`${API_URL}`, {
      method: "POST",
      body: JSON.stringify({ eventType: "ADD_LIST", ...data }),
    });
    return resData;
  } catch (error) {
    throw error;
  }
};

export const updateListAPI = async (
  data: Omit<UpdateListEvent, "eventType">
): Promise<UpdateListEventResponse> => {
  try {
    const resData = await fetchWithAuth(`${API_URL}`, {
      method: "POST",
      body: JSON.stringify({ eventType: "UPDATE_LIST", ...data }),
    });
    return resData;
  } catch (error) {
    throw error;
  }
};

export const deleteListAPI = async (
  data: Omit<DeleteListEvent, "eventType">
): Promise<DeleteListEventResponse> => {
  try {
    const resData = await fetchWithAuth(`${API_URL}`, {
      method: "POST",
      body: JSON.stringify({ eventType: "DELETE_LIST", ...data }),
    });
    return resData;
  } catch (error) {
    throw error;
  }
};

export const updateListPositionAPI = async (
  data: Omit<UpdateListPositionEvent, "eventType">
): Promise<UpdateListPositionEventResponse> => {
  try {
    const resData = await fetchWithAuth(`${API_URL}`, {
      method: "POST",
      body: JSON.stringify({ eventType: "UPDATE_LIST_POSITION", ...data }),
    });
    return resData;
  } catch (error) {
    throw error;
  }
};

export const getListsAPI = async (boardId: string): Promise<List[]> => {
  // Stub for now
  return [];
};
