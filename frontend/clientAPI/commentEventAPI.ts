import {
  AddCommentEvent,
  AddCommentEventResponse,
} from "@backend/boardEvents/addComment.event";
import {
  UpdateCommentEvent,
  UpdateCommentEventResponse,
} from "@backend/boardEvents/updateComment.event";
import {
  DeleteCommentEvent,
  DeleteCommentEventResponse,
} from "@backend/boardEvents/deleteComment.event";
import {
  GetTicketCommentsEvent,
  GetTicketCommentsResponse,
} from "@backend/boardEvents/getTicketComments.event";
import { fetchWithAuth } from "./helper";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/event`;

export const addCommentAPI = async (
  data: Omit<AddCommentEvent, "eventType">,
): Promise<AddCommentEventResponse> => {
  return fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify({ eventType: "ADD_COMMENT", ...data }),
  });
};

export const updateCommentAPI = async (
  data: Omit<UpdateCommentEvent, "eventType">,
): Promise<UpdateCommentEventResponse> => {
  return fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify({ eventType: "UPDATE_COMMENT", ...data }),
  });
};

export const deleteCommentAPI = async (
  data: Omit<DeleteCommentEvent, "eventType">,
): Promise<DeleteCommentEventResponse> => {
  return fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify({ eventType: "DELETE_COMMENT", ...data }),
  });
};

export const getTicketCommentsAPI = async (
  data: Omit<GetTicketCommentsEvent, "eventType">,
): Promise<GetTicketCommentsResponse> => {
  return fetchWithAuth(API_URL, {
    method: "POST",
    body: JSON.stringify({ eventType: "GET_TICKET_COMMENTS", ...data }),
  });
};
