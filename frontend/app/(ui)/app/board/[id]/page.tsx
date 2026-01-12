"use client";

import { useQuery } from "@tanstack/react-query";
import { getBoardAPI } from "@/clientAPI/boardEventAPI";
import { BoardContainer } from "@/components/board/board-container";
import { BoardHeader } from "@/components/board/board-header";
import { ListContainer } from "@/components/board/list-container";
import { applyServerEvent } from "@/async/eventRouter";
import { socket } from "@/async/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useBoardDataStore from "@/store/boardData.store";
import useBoardOrderStore from "@/store/boardOrder.store";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;
  const setBoard = useBoardDataStore((state) => state.setBoard);
  const board = useBoardDataStore((state) => state.boardData);
  const setBoardOrder = useBoardOrderStore((state) => state.setBoardOrder);
  const listOrder = useBoardOrderStore((state) => state.listOrder);

  const [isConnected, setIsConnected] = useState(socket.connected);
  console.log("Is connected:", isConnected);

  useEffect(() => {
    function onConnect() {
      console.log("Socket connected, joining board:", boardId);
      setIsConnected(true);
      socket.emit("join-board", boardId);
    }

    function onDisconnect() {
      console.log("Socket disconnected");
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("boardEvent", applyServerEvent);

    // If already connected, join the board immediately
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("boardEvent", applyServerEvent);
    };
  }, [boardId]); // Re-run if the boardId changes

  const { data, isLoading, error } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardAPI({ boardId }),
    enabled: !!boardId,
  });

  useEffect(() => {
    if (data) {
      const { board, lists, tickets } = data;
      setBoard({ board, lists, tickets });
      setBoardOrder({ lists, tickets });
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <div className="text-xl font-medium animate-pulse text-muted-foreground">
          Loading board...
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted">
        <h2 className="text-xl font-bold text-destructive">
          Error loading board
        </h2>
        <p className="text-muted-foreground">
          {(error as Error)?.message || "Board not found or access denied"}
        </p>
        <a href="/app/dashboard" className="text-primary hover:underline">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return (
    <BoardContainer board={board}>
      <BoardHeader title={board.title} boardId={board.id} />
      <div className="h-full overflow-x-auto">
        <ListContainer />
      </div>
    </BoardContainer>
  );
}
