import { fetchWithAuth } from "./helper";
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/event`;
import {
  AddTicketEvent,
  AddTicketEventResponse,
} from "@backend/boardEvents/addTicket.event";
import {
  UpdateTicketEvent,
  UpdateTicketEventResponse,
} from "@backend/boardEvents/updateTicket.event";
import {
  DeleteTicketEvent,
  DeleteTicketEventResponse,
} from "@backend/boardEvents/deleteTicket.event";
import {
  MoveTicketEvent,
  MoveTicketEventResponse,
} from "@backend/boardEvents/moveTicket.event";

export const addTicketAPI = async (
  data: Omit<AddTicketEvent, "eventType">
): Promise<AddTicketEventResponse> => {
  try {
    const resData = await fetchWithAuth(`${API_URL}`, {
      method: "POST",
      body: JSON.stringify({ eventType: "ADD_TICKET", ...data }),
    });
    return resData;
  } catch (error) {
    throw error;
  }
};

export const updateTicketAPI = async (
  data: Omit<UpdateTicketEvent, "eventType">
): Promise<UpdateTicketEventResponse> => {
  try {
    const resData = await fetchWithAuth(`${API_URL}`, {
      method: "POST",
      body: JSON.stringify({ eventType: "UPDATE_TICKET", ...data }),
    });
    return resData;
  } catch (error) {
    throw error;
  }
};

export const deleteTicketAPI = async (
  data: Omit<DeleteTicketEvent, "eventType">
): Promise<DeleteTicketEventResponse> => {
  try {
    const resData = await fetchWithAuth(`${API_URL}`, {
      method: "POST",
      body: JSON.stringify({ eventType: "DELETE_TICKET", ...data }),
    });
    return resData;
  } catch (error) {
    throw error;
  }
};

export const updateTicketPositionAPI = async (
  data: Omit<MoveTicketEvent, "eventType">
): Promise<MoveTicketEventResponse> => {
  try {
    const resData = await fetchWithAuth(`${API_URL}`, {
      method: "POST",
      body: JSON.stringify({ eventType: "MOVE_TICKET", ...data }),
    });
    return resData;
  } catch (error) {
    throw error;
  }
};
