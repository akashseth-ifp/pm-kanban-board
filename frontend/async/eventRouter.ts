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
  | MoveTicketEventResponse;

export function applyServerEvent(event: Event) {
  console.log("Received socket event:", event);

  // If event is null or doesn't have eventType, ignore it
  if (!event || !event.eventType) {
    console.warn("Received malformed event:", event);
    return;
  }

  // don't run optimistic updates
  if (useBoardDataStore.getState().boardVersion >= event.version) {
    console.log("Optimistic update skipped");
    return;
  }

  if (useBoardDataStore.getState().boardVersion + 1 !== event.version) {
    console.log("Reconciling events");
    reconcileEvents();
  } else {
    eventHandler(event);
  }

  return "success";
}

export async function reconcileEvents() {
  const boardId = useBoardDataStore.getState().boardId;
  const version = useBoardDataStore.getState().boardVersion;
  const boardEvents = await getBoardEventsAPI(boardId!, version);

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
          moveListPayload.position
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
          addTicketPayload.listId
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
          (event as DeleteTicketEventResponse).listId
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
          moveTicketPayload.position
        );
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
