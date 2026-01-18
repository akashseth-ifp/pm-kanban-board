"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { updateTicketPositionAPI } from "@/clientAPI/ticketEventAPI";
import { MoveTicketEvent } from "@backend/boardEvents/moveTicket.event";
import useBoardDataStore from "@/store/boardData.store";
import { MoveListEvent } from "@backend/boardEvents/moveList.event";
import { moveListAPI } from "@/clientAPI/listEventAPI";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60 * 1000 },
        mutations: {
          networkMode: "offlineFirst",
          retry: 3, // Ensure it retries/pauses on network failure
        },
      },
    });

    // Set defaults ONCE during initialization
    client.setMutationDefaults(["updateTicketPosition"], {
      mutationFn: (data: MoveTicketEvent["payload"]) =>
        updateTicketPositionAPI({
          boardId: useBoardDataStore.getState().boardId!,
          payload: data,
        }),
    });

    client.setMutationDefaults(["updateListPosition"], {
      mutationFn: (data: MoveListEvent["payload"]) =>
        moveListAPI({
          boardId: useBoardDataStore.getState().boardId!,
          payload: data,
        }),
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
