import useBoardDataStore from "@/store/boardData.store";
import useBoardOrderStore from "@/store/boardOrder.store";
import { AddListEventResponse } from "@backend/boardEvents/addList.event";
import { UpdateListEventResponse } from "@backend/boardEvents/updateList.event";
import { DeleteListEventResponse } from "@backend/boardEvents/deleteList.event";
import { UpdateBoardEventResponse } from "@backend/boardEvents/updateBoard.event";
import { DeleteBoardEventResponse } from "@backend/boardEvents/deleteBoard.event";
import { AddTicketEventResponse } from "@backend/boardEvents/addTicket.event";
import { UpdateTicketEventResponse } from "@backend/boardEvents/updateTicket.event";
import { DeleteTicketEventResponse } from "@backend/boardEvents/deleteTicket.event";
import { toast } from "sonner";
import { MoveListEventResponse } from "@backend/boardEvents/moveList.event";
import { getBoardEventsAPI } from "@/clientAPI/boardAPI";
import { MoveTicketEventResponse } from "@backend/boardEvents/moveTicket.event";
import { AddCommentEventResponse } from "@backend/boardEvents/addComment.event";
import { UpdateCommentEventResponse } from "@backend/boardEvents/updateComment.event";
import { DeleteCommentEventResponse } from "@backend/boardEvents/deleteComment.event";

type Event =
  | AddListEventResponse
  | UpdateListEventResponse
  | DeleteListEventResponse
  | MoveListEventResponse
  | UpdateBoardEventResponse
  | DeleteBoardEventResponse
  | AddTicketEventResponse
  | UpdateTicketEventResponse
  | DeleteTicketEventResponse
  | MoveTicketEventResponse
  | AddCommentEventResponse
  | UpdateCommentEventResponse
  | DeleteCommentEventResponse;

export function applyServerEvent(event: Event | Event[]) {
  // If it's an array, process each event individually
  if (Array.isArray(event)) {
    console.log(`Received batch of ${event.length} socket events`);
    event.forEach((e) => applyServerEvent(e));
    return "success";
  }

  console.log("Received socket event:", event);

  // If event is null or doesn't have eventType, ignore it
  if (!event || !event.eventType) {
    console.warn("Received malformed event:", event);
    return;
  }

  // Guard: Don't process events if we don't have an active board session in the store
  const state = useBoardDataStore.getState();
  if (!state.boardId) {
    console.log("No active boardId in store, skipping event:", event.eventType);
    return;
  }

  // don't run optimistic updates
  if (useBoardDataStore.getState().boardVersion >= event.version) {
    console.log("Optimistic update skipped");
    return;
  }

  if (useBoardDataStore.getState().boardVersion + 1 !== event.version) {
    console.log(
      `Version mismatch (local: ${useBoardDataStore.getState().boardVersion}, event: ${event.version}). Reconciling...`,
    );
    reconcileEvents();
  } else {
    eventHandler(event);
  }

  return "success";
}

export async function reconcileEvents() {
  const { boardId, boardVersion: version } = useBoardDataStore.getState();

  if (!boardId || boardId === "null") {
    console.warn("reconcileEvents aborted: invalid boardId in store:", boardId);
    return;
  }

  console.log(
    `Reconciling events for board ${boardId} from version ${version}`,
  );
  const boardEvents = await getBoardEventsAPI(boardId, version);

  boardEvents.forEach((event) => {
    eventHandler(event as Event);
  });
}

function eventHandler(event: Event) {
  // Update the server version
  useBoardDataStore.getState().setServerVersion(event.version);
  // Update the client version
  useBoardDataStore.getState().setVersion(event.version);

  switch (event.eventType) {
    case "ADD_LIST":
      const { payload: addListPayload } = event as AddListEventResponse;
      console.log("ADD_LIST payload:", addListPayload);
      useBoardDataStore.getState().addList(addListPayload);
      useBoardOrderStore.getState().addList({
        id: addListPayload.id,
        position: addListPayload.position,
      });
      break;

    case "UPDATE_LIST":
      const { payload: updateListPayload } = event as UpdateListEventResponse;
      console.log("UPDATE_LIST payload:", updateListPayload);
      useBoardDataStore
        .getState()
        .updateList(updateListPayload.id, updateListPayload);
      break;

    case "DELETE_LIST":
      const { payload: deleteListPayload } = event as DeleteListEventResponse;
      console.log("DELETE_LIST payload:", deleteListPayload);
      useBoardOrderStore.getState().deleteList(deleteListPayload.id);
      useBoardDataStore.getState().deleteList(deleteListPayload.id);
      break;

    case "MOVE_LIST":
      const { payload: moveListPayload } = event as MoveListEventResponse;

      console.log("MOVE_LIST payload:", moveListPayload);
      useBoardOrderStore
        .getState()
        .updateListPosition(
          moveListPayload.id,
          moveListPayload.fromIndex,
          moveListPayload.toIndex,
          moveListPayload.position,
        );
      break;

    case "UPDATE_BOARD":
      const { payload: updateBoardPayload } = event as UpdateBoardEventResponse;
      console.log("UPDATE_BOARD payload:", updateBoardPayload);
      useBoardDataStore.getState().updateBoard(updateBoardPayload);
      break;

    case "ADD_TICKET":
      const { payload: addTicketPayload } = event as AddTicketEventResponse;
      console.log("ADD_TICKET payload:", addTicketPayload);
      useBoardDataStore.getState().addTicket(addTicketPayload);
      useBoardOrderStore
        .getState()
        .addTicket(
          { id: addTicketPayload.id, position: addTicketPayload.position },
          addTicketPayload.listId,
        );
      break;

    case "UPDATE_TICKET":
      const { payload: updateTicketPayload } =
        event as UpdateTicketEventResponse;
      console.log("UPDATE_TICKET payload:", updateTicketPayload);
      useBoardDataStore
        .getState()
        .updateTicket(updateTicketPayload.id, updateTicketPayload);
      break;

    case "DELETE_TICKET":
      const { payload: deleteTicketPayload } =
        event as DeleteTicketEventResponse;
      console.log("DELETE_TICKET payload:", deleteTicketPayload);
      useBoardOrderStore
        .getState()
        .deleteTicket(
          deleteTicketPayload.id,
          (event as DeleteTicketEventResponse).listId,
        );
      useBoardDataStore.getState().deleteTicket(deleteTicketPayload.id);
      break;

    case "MOVE_TICKET":
      const { payload: moveTicketPayload } = event as MoveTicketEventResponse;
      console.log("MOVE_TICKET payload:", moveTicketPayload);
      useBoardOrderStore
        .getState()
        .updateTicketPosition(
          moveTicketPayload.id,
          moveTicketPayload.fromListId,
          moveTicketPayload.toListId,
          moveTicketPayload.fromIndex,
          moveTicketPayload.toIndex,
          moveTicketPayload.position,
        );
      break;

    case "ADD_COMMENT":
      const { payload: addCommentPayload } = event as AddCommentEventResponse;
      console.log("ADD_COMMENT payload:", addCommentPayload);
      useBoardDataStore.getState().addComment(addCommentPayload);
      break;

    case "UPDATE_COMMENT":
      const { payload: updateCommentPayload } =
        event as UpdateCommentEventResponse;
      console.log("UPDATE_COMMENT payload:", updateCommentPayload);
      useBoardDataStore
        .getState()
        .updateComment(
          updateCommentPayload.id,
          updateCommentPayload.ticketId,
          updateCommentPayload,
        );
      break;

    case "DELETE_COMMENT":
      const { payload: deleteCommentPayload } =
        event as DeleteCommentEventResponse;
      console.log("DELETE_COMMENT payload:", deleteCommentPayload);
      useBoardDataStore
        .getState()
        .deleteComment(deleteCommentPayload.id, deleteCommentPayload.ticketId);
      break;

    case "DELETE_BOARD":
      console.log("DELETE_BOARD payload:", event as DeleteBoardEventResponse);
      // Typically we'd redirect or show a message if the board is deleted
      toast.info("This board has been deleted. Redirecting to dashboard.");
      setTimeout(() => {
        window.location.href = "/app/dashboard";
        useBoardDataStore.getState().reset();
        useBoardOrderStore.getState().reset();
      }, 3000);
      break;

    default:
      console.warn("Unknown event type", event);
      break;
  }
}
