"use client";
import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import useBoardOrderStore from "@/store/boardOrder.store";
import useBoardDataStore from "@/store/boardData.store";
import { BoardList } from "./board-list";
import { CreateListForm } from "./create-list-form";
import {
  getDNDListPosition,
  getDNDTicketPosition,
} from "@/utils/board-position";
import { moveListAPI } from "@/clientAPI/listEventAPI";
import { updateTicketPositionAPI } from "@/clientAPI/ticketEventAPI";
import { MoveTicketEvent } from "@backend/boardEvents/moveTicket.event";
import { MoveListEvent } from "@backend/boardEvents/moveList.event";

export const ListContainer = () => {
  const params = useParams();
  const listOrder = useBoardOrderStore((state) => state.listOrder);
  const ticketOrderByList = useBoardOrderStore(
    (state) => state.ticketOrderByList
  );
  const scrollableRef = useRef<HTMLOListElement>(null);

  // Update List Position Mutation
  const { mutate: updateListPosition } = useMutation({
    networkMode: "offlineFirst",
    retry: 3,
    mutationKey: ["updateListPosition"],
    mutationFn: (data: MoveListEvent["payload"]) => {
      return moveListAPI({
        boardId: params.id as string,
        payload: data,
      });
    },
    onMutate: (data: MoveListEvent["payload"]) => {
      // Optimistically update the store
      useBoardOrderStore
        .getState()
        .updateListPosition(
          data.id,
          data.fromIndex,
          data.toIndex,
          data.position
        );

      useBoardDataStore.getState().increaseVersion();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to move list");
      useBoardDataStore.getState().decreaseVersion();
    },
  });

  // Update Ticket Position Mutation
  const { mutate: updateTicketPosition } = useMutation({
    networkMode: "offlineFirst",
    mutationKey: ["updateTicketPosition"],
    retry: 3,
    mutationFn: (data: MoveTicketEvent["payload"]) => {
      return updateTicketPositionAPI({
        boardId: params.id as string,
        payload: data,
      });
    },
    onMutate: (data: MoveTicketEvent["payload"]) => {
      // Optimistically update the store
      useBoardOrderStore
        .getState()
        .updateTicketPosition(
          data.id,
          data.fromListId,
          data.toListId,
          data.fromIndex,
          data.toIndex,
          data.position
        );

      useBoardDataStore.getState().increaseVersion();

      // Update ticket's listId in boardDataStore if it moved to a different list
      if (data.fromListId !== data.toListId) {
        useBoardDataStore.getState().updateTicket(data.id, {
          listId: data.toListId,
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to move ticket");
      useBoardDataStore.getState().decreaseVersion();
    },
  });

  // Set up drag and drop monitor
  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const sourceData = source.data;
        const destData = destination.data;
        console.log("sourceData", sourceData);
        console.log("destData", destData);

        // Handle ticket drop
        if (sourceData.type === "ticket") {
          const ticketId = sourceData.ticketId as string;
          const fromListId = sourceData.listId as string;
          const toListId = destData.listId as string;
          const fromIndex = sourceData.index as number;

          // If the ticket is dropped in the same list and at the same position, return
          if (fromListId === toListId && fromIndex === destData.index) return;

          // Get the edge where the drop occurred
          const closestEdge = extractClosestEdge(destData);
          const targetIndex = (destData.index as number) || 0;

          let toIndex: number;

          // If dropping on another ticket or on the list area
          if (
            destData.type === "ticket" ||
            destData.type === "list-ticket-area"
          ) {
            if (destData.type === "ticket") {
              if (fromListId === toListId) {
                // Same list
                if (fromIndex < targetIndex) {
                  // Dragging down
                  toIndex =
                    closestEdge === "bottom" ? targetIndex : targetIndex - 1;
                } else {
                  // Dragging up
                  toIndex =
                    closestEdge === "bottom" ? targetIndex + 1 : targetIndex;
                }
              } else {
                // Different list
                toIndex =
                  closestEdge === "bottom" ? targetIndex + 1 : targetIndex;
              }
            } else {
              // Dropping on empty list area
              toIndex = 0;
            }
          } else {
            // Dropping elsewhere (should be prevented by canDrop, but safety first)
            return;
          }

          console.log("fromIndex", fromIndex);
          console.log("toIndex", toIndex);

          // If the ticket is dropped in the same list and at the same position, return
          if (fromListId === toListId && fromIndex === toIndex) return;

          let topIdx: number;
          let bottomIdx: number;
          if (destData.type === "ticket") {
            if (closestEdge === "top") {
              topIdx = targetIndex - 1;
              bottomIdx = targetIndex;
            } else {
              topIdx = targetIndex;
              bottomIdx = targetIndex + 1;
            }
          } else {
            topIdx = -1;
            bottomIdx = 0;
          }

          // Calculate new position
          const newPosition = getDNDTicketPosition(toListId, topIdx, bottomIdx);
          console.log("newPosition", newPosition);

          updateTicketPosition({
            id: ticketId,
            fromListId,
            toListId,
            fromIndex,
            toIndex,
            position: newPosition,
          });

          // Scroll the dropped ticket into view
          setTimeout(() => {
            const element = document.getElementById(`ticket-card-${ticketId}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }, 0);
        }

        // Handle list drop
        if (sourceData.type === "list") {
          if (sourceData.index === destData.index) return;

          const listId = sourceData.listId as string;
          const fromIndex = sourceData.index as number;

          // Get the edge where the drop occurred
          const closestEdge = extractClosestEdge(destData);
          const targetIndex = destData.index as number;

          let toIndex: number;
          if (fromIndex < targetIndex) {
            // Dragging right
            toIndex = closestEdge === "right" ? targetIndex : targetIndex - 1;
          } else {
            // Dragging left
            toIndex = closestEdge === "right" ? targetIndex + 1 : targetIndex;
          }

          console.log("fromIndex : ", fromIndex);
          console.log("toIndex : ", toIndex);

          if (fromIndex === toIndex) return;

          // Bound check
          if (toIndex < 0) toIndex = 0;
          if (toIndex >= listOrder.length) toIndex = listOrder.length - 1;

          let leftIdx: number;
          let rightIdx: number;
          if (closestEdge === "left") {
            leftIdx = targetIndex - 1;
            rightIdx = targetIndex;
          } else {
            leftIdx = targetIndex;
            rightIdx = targetIndex + 1;
          }
          const newPosition = getDNDListPosition(leftIdx, rightIdx);
          console.log("List new position: ", newPosition);

          updateListPosition({
            id: listId,
            fromIndex,
            toIndex,
            position: newPosition,
          });
        }
      },
    });
  }, [listOrder, updateListPosition, updateTicketPosition]);

  // Set up auto-scroll for the board (horizontal scrolling)
  useEffect(() => {
    const element = scrollableRef.current;
    if (!element) return;
    return autoScrollForElements({
      element,
      canScroll: ({ source }) =>
        source.data.type === "list" || source.data.type === "ticket",
    });
  }, []);

  return (
    <ol
      ref={scrollableRef}
      className="flex h-full gap-x-3 overflow-x-auto overflow-y-hidden p-4 select-none items-start"
    >
      {listOrder.map(({ id }) => (
        <BoardList key={id} listId={id} />
      ))}
      <div className="w-[272px] shrink-0">
        <CreateListForm />
      </div>
      {/* Spacer for better scrolling */}
      <div className="w-1" />
    </ol>
  );
};
