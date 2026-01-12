import useBoardDataStore from "@/store/boardData.store";
import useBoardOrderStore from "@/store/boardOrder.store";
import { AddListEventResponse } from "@backend/boardEvents/addList.event";

export function applyServerEvent(event: AddListEventResponse) {
  console.log("Received socket event:", event);
  switch (event.eventType) {
    case "ADD_LIST":
      console.log("ADD_LIST payload:", event.payload);
      useBoardDataStore.getState().addList(event.payload);
      useBoardOrderStore.getState().addList({
        id: event.payload.id,
        position: event.payload.position,
      });
      break;

    default:
      console.warn("Unknown event type", event.eventType);
  }
}
