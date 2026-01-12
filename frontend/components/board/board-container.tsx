"use client";

import { Board } from "@backend/schema/board.schema";
import { cn } from "@/lib/utils";

interface BoardContainerProps {
  board: Board;
  children: React.ReactNode;
}

export const BoardContainer = ({ board, children }: BoardContainerProps) => {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-white dark:bg-slate-950"
      )}
    >
      {children}
    </div>
  );
};
