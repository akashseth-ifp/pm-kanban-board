import useBoardDataStore from "@/store/boardData.store";
import useBoardOrderStore from "@/store/boardOrder.store";
import { AddListEventResponse } from "@backend/boardEvents/addList.event";
import { UpdateListEventResponse } from "@backend/boardEvents/updateList.event";
import { DeleteListEventResponse } from "@backend/boardEvents/deleteList.event";

type Event =
  | AddListEventResponse
  | UpdateListEventResponse
  | DeleteListEventResponse;

export function applyServerEvent(event: Event) {
  console.log("Received socket event:", event);
  switch (event.eventType) {
    case "ADD_LIST":
      console.log("ADD_LIST payload:", event.payload);
      useBoardDataStore.getState().setVersion(event.version);
      useBoardDataStore.getState().addList(event.payload);
      useBoardOrderStore.getState().addList({
        id: event.payload.id,
        position: event.payload.position,
      });
      break;
    case "UPDATE_LIST":
      console.log("UPDATE_LIST payload:", event.payload);
      useBoardDataStore.getState().setVersion(event.version);
      useBoardDataStore.getState().updateList(event.payload.id, event.payload);
      break;
    case "DELETE_LIST":
      console.log("DELETE_LIST payload:", event.payload);
      useBoardDataStore.getState().setVersion(event.version);
      useBoardDataStore.getState().deleteList(event.payload.id);
      useBoardOrderStore.getState().deleteList(event.payload.id);
      break;

    default:
      console.warn("Unknown event type", event);
      break;
  }
}
