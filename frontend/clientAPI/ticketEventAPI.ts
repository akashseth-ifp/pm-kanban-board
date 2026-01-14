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
  UpdateTicketPositionEvent,
  UpdateTicketPositionEventResponse,
} from "@backend/boardEvents/updateTicketPosition.event";

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
  data: Omit<UpdateTicketPositionEvent, "eventType">
): Promise<UpdateTicketPositionEventResponse> => {
  try {
    const resData = await fetchWithAuth(`${API_URL}`, {
      method: "POST",
      body: JSON.stringify({ eventType: "UPDATE_TICKET_POSITION", ...data }),
    });
    return resData;
  } catch (error) {
    throw error;
  }
};
