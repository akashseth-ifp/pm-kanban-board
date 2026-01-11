// sync/eventRouter.ts
import useBoardDataStore from "@/store/boardData.store";
// import { boardIndexStore } from '@/store/boardIndex.store'
// import { BoardEvent } from './types'

export function applyServerEvent(event: any) {
  console.log("Received socket event:", event);
  switch (event.eventType) {
    case "ADD_LIST":
      console.log("ADD_LIST payload:", event.payload);
      // TODO: Add to store
      // boardStore.addList(event.payload);
      break;

    default:
      console.warn("Unknown event type", event.eventType);
  }
}
