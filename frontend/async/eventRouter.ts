import useBoardDataStore from "@/store/boardData.store";
import useBoardOrderStore from "@/store/boardOrder.store";
import { AddListEventResponse } from "@backend/boardEvents/addList.event";
import { UpdateListEventResponse } from "@backend/boardEvents/updateList.event";
import { DeleteListEventResponse } from "@backend/boardEvents/deleteList.event";
import { UpdateBoardEventResponse } from "@backend/boardEvents/updateBoard.event";
import { DeleteBoardEventResponse } from "@backend/boardEvents/deleteBoard.event";
import { toast } from "sonner";

type Event =
  | AddListEventResponse
  | UpdateListEventResponse
  | DeleteListEventResponse
  | UpdateBoardEventResponse
  | DeleteBoardEventResponse;

export function applyServerEvent(event: Event) {
  console.log("Received socket event:", event);

  // If event is null or doesn't have eventType, ignore it
  if (!event || !event.eventType) {
    console.warn("Received malformed event:", event);
    return;
  }

  switch (event.eventType) {
    case "ADD_LIST":
      console.log("ADD_LIST payload:", (event as AddListEventResponse).payload);
      useBoardDataStore
        .getState()
        .setVersion((event as AddListEventResponse).version);
      useBoardDataStore
        .getState()
        .addList((event as AddListEventResponse).payload);
      useBoardOrderStore.getState().addList({
        id: (event as AddListEventResponse).payload.id,
        position: (event as AddListEventResponse).payload.position,
      });
      break;
    case "UPDATE_LIST":
      console.log(
        "UPDATE_LIST payload:",
        (event as UpdateListEventResponse).payload
      );
      useBoardDataStore
        .getState()
        .setVersion((event as UpdateListEventResponse).version);
      useBoardDataStore
        .getState()
        .updateList(
          (event as UpdateListEventResponse).payload.id,
          (event as UpdateListEventResponse).payload
        );
      break;
    case "DELETE_LIST":
      console.log(
        "DELETE_LIST payload:",
        (event as DeleteListEventResponse).payload
      );
      useBoardDataStore
        .getState()
        .setVersion((event as DeleteListEventResponse).version);
      useBoardDataStore
        .getState()
        .deleteList((event as DeleteListEventResponse).payload.id);
      useBoardOrderStore
        .getState()
        .deleteList((event as DeleteListEventResponse).payload.id);
      break;

    case "UPDATE_BOARD":
      console.log(
        "UPDATE_BOARD payload:",
        (event as UpdateBoardEventResponse).payload
      );
      useBoardDataStore
        .getState()
        .setVersion((event as UpdateBoardEventResponse).version);
      useBoardDataStore
        .getState()
        .updateBoard((event as UpdateBoardEventResponse).payload);
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
