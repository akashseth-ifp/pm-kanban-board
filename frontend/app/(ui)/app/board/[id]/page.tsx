"use client";

import { useQuery, QueryClient } from "@tanstack/react-query";
import { getBoardAPI } from "@/clientAPI/boardEventAPI";
import { BoardContainer } from "@/components/board/board-container";
import { BoardHeader } from "@/components/board/board-header";
import { ListContainer } from "@/components/board/list-container";
import { applyServerEvent, reconcileEvents } from "@/async/eventRouter";
import { socket } from "@/async/socket";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import useBoardDataStore from "@/store/boardData.store";
import useBoardOrderStore from "@/store/boardOrder.store";
import { toast } from "sonner";
import { useIsOnline } from "@/hooks/useIsOnline";
export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;
  const resetBoardData = useBoardDataStore((state) => state.reset);
  const resetBoardOrder = useBoardOrderStore((state) => state.reset);
  const setBoard = useBoardDataStore((state) => state.setBoard);
  const board = useBoardDataStore((state) => state.boardData);
  const setBoardOrder = useBoardOrderStore((state) => state.setBoardOrder);
  const queryClient = new QueryClient();

  const isOnline = useIsOnline();
  const [isConnected, setIsConnected] = useState(socket.connected && isOnline);
  const isInitialConnection = useRef(true);

  useEffect(() => {
    // manually connect the socket
    socket.connect();

    function onConnect() {
      console.log("Socket connected, joining board:", boardId, board);
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
      socket.disconnect();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("boardEvent", applyServerEvent);
      resetBoardData();
      resetBoardOrder();
    };
  }, [boardId]); // Re-run if the boardId changes

  const { data, isLoading, error } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardAPI({ boardId }),
    staleTime: Infinity,
    enabled: !!boardId,
  });

  useEffect(() => {
    if (data) {
      const { board, lists, tickets } = data;
      setBoard({ board, lists, tickets });
      setBoardOrder({ lists, tickets });
    }
  }, [data]);

  // Sync state with hook and socket
  useEffect(() => {
    setIsConnected(socket.connected && isOnline);
    if (!isOnline || !board) return;

    const syncState = async () => {
      // 1. Force Resume
      await queryClient.resumePausedMutations();

      // 2. STRICTOR WAIT: Ensure no mutations are even in 'loading' or 'pending'
      // We poll until the total mutation count is 0
      await new Promise<void>((resolve) => {
        const check = () => {
          const isBusy = queryClient.isMutating() > 0;
          if (!isBusy) resolve();
          else setTimeout(check, 200);
        };
        check();
      });

      // 3. DATABASE SETTLE TIME: Add a small delay (100-200ms)
      // This allows the DB transactions to fully commit before we fetch.
      await new Promise((r) => setTimeout(r, 200));

      console.log("System Idle. Reconciling...");
      await reconcileEvents();
    };

    syncState();
  }, [isOnline]);

  useEffect(() => {
    if (isConnected) {
      if (!isInitialConnection.current) {
        toast.success("Connected to board");
      }
      isInitialConnection.current = false;
    } else {
      // Only toast error if we've already had an initial connection
      if (!isInitialConnection.current) {
        toast.error("Disconnected from board");
      }
    }
  }, [isConnected]);

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
