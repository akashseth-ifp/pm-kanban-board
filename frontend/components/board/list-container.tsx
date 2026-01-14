"use client";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import useBoardOrderStore from "@/store/boardOrder.store";
import useBoardDataStore from "@/store/boardData.store";
import { BoardList } from "./board-list";
import { CreateListForm } from "./create-list-form";
import {
  getDNDListPosition,
  getDNDTicketPosition,
} from "@/utils/board-position";
import { updateListPositionAPI } from "@/clientAPI/listEventAPI";
import { updateTicketPositionAPI } from "@/clientAPI/ticketEventAPI";

export const ListContainer = () => {
  const params = useParams();
  const listOrder = useBoardOrderStore((state) => state.listOrder);
  const ticketOrderByList = useBoardOrderStore(
    (state) => state.ticketOrderByList
  );

  // Update List Position Mutation
  const { mutate: updateListPosition } = useMutation({
    mutationFn: (data: {
      listId: string;
      fromIndex: number;
      toIndex: number;
      newPosition: number;
    }) => {
      // Optimistically update the store
      useBoardOrderStore
        .getState()
        .updateListPosition(
          data.listId,
          data.fromIndex,
          data.toIndex,
          data.newPosition
        );

      return updateListPositionAPI({
        boardId: params.id as string,
        payload: {
          id: data.listId,
          position: data.newPosition,
        },
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to move list");
    },
  });

  // Update Ticket Position Mutation
  const { mutate: updateTicketPosition } = useMutation({
    mutationFn: (data: {
      ticketId: string;
      fromListId: string;
      toListId: string;
      fromIndex: number;
      toIndex: number;
      newPosition: number;
    }) => {
      // Optimistically update the store
      useBoardOrderStore
        .getState()
        .updateTicketPosition(
          data.ticketId,
          data.fromListId,
          data.toListId,
          data.fromIndex,
          data.toIndex,
          data.newPosition
        );

      // Update ticket's listId in boardDataStore if it moved to a different list
      if (data.fromListId !== data.toListId) {
        useBoardDataStore.getState().updateTicket(data.ticketId, {
          listId: data.toListId,
        });
      }

      return updateTicketPositionAPI({
        boardId: params.id as string,
        listId: data.fromListId,
        payload: {
          id: data.ticketId,
          position: data.newPosition,
          listId: data.toListId,
        },
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to move ticket");
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

        // Handle ticket drop
        if (sourceData.type === "ticket") {
          const ticketId = sourceData.ticketId as string;
          const fromListId = sourceData.listId as string;
          const toListId = destData.listId as string;
          const fromIndex = sourceData.index as number;

          const targetTickets = ticketOrderByList[toListId] || [];

          // Calculate destination index based on drop position
          // For simplicity, we'll add to the end of the list
          // You can enhance this with closestEdge from hitbox for more precise positioning
          const toIndex = targetTickets.length;

          // Calculate new position
          const newPosition = getDNDTicketPosition(targetTickets, toIndex);

          updateTicketPosition({
            ticketId,
            fromListId,
            toListId,
            fromIndex,
            toIndex,
            newPosition,
          });
        }

        // Handle list drop
        if (sourceData.type === "list") {
          const listId = sourceData.listId as string;
          const fromIndex = sourceData.index as number;

          // For list reordering, we need to determine the new index
          // This is a simplified version - you can enhance with hitbox
          const toIndex = destData.index as number;

          if (fromIndex === toIndex) return;

          // Calculate new position
          const newListOrder = [...listOrder];
          const newPosition = getDNDListPosition(newListOrder, toIndex);

          updateListPosition({
            listId,
            fromIndex,
            toIndex,
            newPosition,
          });
        }
      },
    });
  }, [listOrder, ticketOrderByList, updateListPosition, updateTicketPosition]);

  return (
    <ol className="flex h-full gap-x-3 overflow-x-auto p-4 select-none">
      {listOrder.map(({ id }, index) => (
        <BoardList key={id} index={index} listId={id} />
      ))}
      <div className="w-[272px] shrink-0">
        <CreateListForm />
      </div>
      {/* Spacer for better scrolling */}
      <div className="w-1" />
    </ol>
  );
};
