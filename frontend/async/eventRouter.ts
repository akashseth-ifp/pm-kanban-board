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
import { UpdateListPositionEventResponse } from "@backend/boardEvents/updateListPosition.event";
import { UpdateTicketPositionEventResponse } from "@backend/boardEvents/updateTicketPosition.event";
import { toast } from "sonner";

type Event =
  | AddListEventResponse
  | UpdateListEventResponse
  | UpdateListPositionEventResponse
  | DeleteListEventResponse
  | UpdateBoardEventResponse
  | DeleteBoardEventResponse
  | AddTicketEventResponse
  | UpdateTicketEventResponse
  | UpdateTicketPositionEventResponse
  | DeleteTicketEventResponse;

export function applyServerEvent(event: Event) {
  console.log("Received socket event:", event);

  // If event is null or doesn't have eventType, ignore it
  if (!event || !event.eventType) {
    console.warn("Received malformed event:", event);
    return;
  }

  switch (event.eventType) {
    case "ADD_LIST":
      const { payload: addListPayload } = event as AddListEventResponse;
      console.log("ADD_LIST payload:", addListPayload);
      useBoardDataStore.getState().setVersion(event.version);
      useBoardDataStore.getState().addList(addListPayload);
      useBoardOrderStore.getState().addList({
        id: addListPayload.id,
        position: addListPayload.position,
      });
      break;

    case "UPDATE_LIST":
      const { payload: updateListPayload } = event as UpdateListEventResponse;
      console.log("UPDATE_LIST payload:", updateListPayload);
      useBoardDataStore.getState().setVersion(event.version);
      useBoardDataStore
        .getState()
        .updateList(updateListPayload.id, updateListPayload);
      break;

    case "DELETE_LIST":
      const { payload: deleteListPayload } = event as DeleteListEventResponse;
      console.log("DELETE_LIST payload:", deleteListPayload);
      useBoardOrderStore.getState().deleteList(deleteListPayload.id);
      useBoardDataStore.getState().setVersion(event.version);
      useBoardDataStore.getState().deleteList(deleteListPayload.id);
      break;

    case "UPDATE_LIST_POSITION":
      const { payload: updateListPositionPayload } =
        event as UpdateListPositionEventResponse;
      console.log("UPDATE_LIST_POSITION payload:", updateListPositionPayload);
      useBoardDataStore.getState().setVersion(event.version);
      // Find the current index and calculate the new index based on position
      const currentListOrder = useBoardOrderStore.getState().listOrder;
      const currentListIndex = currentListOrder.findIndex(
        (l) => l.id === updateListPositionPayload.id
      );
      if (currentListIndex !== -1) {
        // Find where this list should be inserted based on its new position
        let newListIndex = currentListOrder.findIndex(
          (l, idx) =>
            idx !== currentListIndex &&
            l.position > updateListPositionPayload.position
        );
        if (newListIndex === -1) newListIndex = currentListOrder.length;
        useBoardOrderStore
          .getState()
          .updateListPosition(
            updateListPositionPayload.id,
            currentListIndex,
            newListIndex,
            updateListPositionPayload.position
          );
      }
      break;

    case "UPDATE_BOARD":
      const { payload: updateBoardPayload } = event as UpdateBoardEventResponse;
      console.log("UPDATE_BOARD payload:", updateBoardPayload);
      useBoardDataStore.getState().setVersion(event.version);
      useBoardDataStore.getState().updateBoard(updateBoardPayload);
      break;

    case "ADD_TICKET":
      const { payload: addTicketPayload } = event as AddTicketEventResponse;
      console.log("ADD_TICKET payload:", addTicketPayload);
      useBoardDataStore.getState().setVersion(event.version);
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
      useBoardDataStore.getState().setVersion(event.version);
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
      useBoardDataStore.getState().setVersion(event.version);
      useBoardDataStore.getState().deleteTicket(deleteTicketPayload.id);
      break;

    case "UPDATE_TICKET_POSITION":
      const {
        payload: updateTicketPositionPayload,
        listId,
        fromListId,
      } = event as UpdateTicketPositionEventResponse;
      console.log(
        "UPDATE_TICKET_POSITION payload:",
        updateTicketPositionPayload
      );
      useBoardDataStore.getState().setVersion(event.version);

      const oldListId = fromListId || listId;
      const newListId = listId;

      // Update ticket's listId in boardDataStore if it moved to a different list
      if (oldListId !== newListId) {
        useBoardDataStore
          .getState()
          .updateTicket(updateTicketPositionPayload.id, {
            listId: newListId,
          });
      }

      // Find the current index and calculate the new index based on position
      const currentTicketOrder =
        useBoardOrderStore.getState().ticketOrderByList[oldListId] || [];
      const currentTicketIndex = currentTicketOrder.findIndex(
        (t) => t.id === updateTicketPositionPayload.id
      );

      if (currentTicketIndex !== -1 || oldListId !== newListId) {
        const targetTicketOrder =
          useBoardOrderStore.getState().ticketOrderByList[newListId] || [];
        // Find where this ticket should be inserted based on its new position
        let newTicketIndex = targetTicketOrder.findIndex(
          (t) => t.position > updateTicketPositionPayload.position
        );
        if (newTicketIndex === -1) newTicketIndex = targetTicketOrder.length;

        useBoardOrderStore
          .getState()
          .updateTicketPosition(
            updateTicketPositionPayload.id,
            oldListId,
            newListId,
            currentTicketIndex === -1 ? 0 : currentTicketIndex,
            newTicketIndex,
            updateTicketPositionPayload.position
          );
      }
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
