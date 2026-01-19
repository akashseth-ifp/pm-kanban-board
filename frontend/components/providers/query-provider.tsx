"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { staleTime: Infinity },
        mutations: {
          networkMode: "offlineFirst",
          retry: 3,
        },
      },
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
