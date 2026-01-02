"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllBoardsAPI, createBoardAPI } from "@/clientAPI/boardAPI"
import { BoardModal } from "./create-board-modal"
import { Board } from "./board"
import { IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import { CreateBoardData } from "@/clientAPI/boardAPI"

export const YourWorkspace = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const queryClient = useQueryClient()

  // 1. Fetch Boards
  const { data: boards, isLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: getAllBoardsAPI,
  })

  // 2. Create Board Mutation
  const createMutation = useMutation({
    mutationFn: (values: CreateBoardData) => {
        return createBoardAPI(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create board")
    },
  })

  if (isLoading) {
      return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading workspaces...</div>
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-tight">Your Workspaces</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Create Board Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg bg-muted/50 border-2 border-dashed border-muted-foreground/25 hover:bg-muted hover:border-muted-foreground/50 transition-all group"
          >
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">New Board</span>
            <IconPlus className="size-6 text-muted-foreground group-hover:text-foreground" />
          </button>

          {/* Existing Boards */}
          {boards?.map((board) => (
            <Board key={board.id} board={board} />
          ))}
        </div>
      </section>

      <BoardModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={(values) => createMutation.mutate(values)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}