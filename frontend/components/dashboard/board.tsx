"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateBoardAPI, deleteBoardAPI, UpdateBoardData } from "@/clientAPI/boardAPI"
import { BoardModal } from "./create-board-modal" // Note: renamed file in later step or rename export
import { gradientBackgrounds } from "@/lib/utils"
import { IconExternalLink, IconEdit, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Board as BoardType } from "@backend/schema/board.schema"

interface BoardProps {
  board: BoardType
}

export const Board = ({ board }: BoardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const queryClient = useQueryClient()

  // 1. Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateBoardData) => updateBoardAPI(board.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
      toast.success(`Board "${board.title}" updated successfully`)
      setIsEditModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update board")
    },
  })

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteBoardAPI(board.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] })
      toast.success(`Board "${board.title}" deleted successfully`)
      setIsDeleteOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete board")
    },
  })

  return (
    <>
      <div className="group relative flex h-32 flex-col justify-between rounded-lg p-4 shadow-sm transition-transform hover:scale-[1.02]"
           style={{ background: board.background ? gradientBackgrounds[board.background as keyof typeof gradientBackgrounds] || board.background : 'white' }}>
        
        <Link href={`/app/board/${board.id}`} className="absolute inset-0 z-0">
            <span className="sr-only">Open {board.title}</span>
        </Link>

        <div className="relative z-10 flex items-start justify-between">
          <h3 className="font-semibold text-white truncate drop-shadow-sm">{board.title}</h3>
          <IconExternalLink className="size-4 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="relative z-10 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button 
            onClick={(e) => {
                e.preventDefault();
                setIsEditModalOpen(true);
            }}
            className="rounded-md bg-white/10 p-2 backdrop-blur-md hover:bg-white/90 hover:text-black transition-all hover:scale-110 active:scale-95 shadow-sm border border-white/20"
            title="Edit Board"
          >
            <IconEdit className="size-4" />
          </button>
          <button 
            onClick={(e) => {
                e.preventDefault();
                setIsDeleteOpen(true);
            }}
            className="rounded-md bg-white/10 p-2 backdrop-blur-md hover:bg-destructive hover:text-destructive-foreground transition-all hover:scale-110 active:scale-95 shadow-sm border border-white/20"
            title="Delete Board"
          >
            <IconTrash className="size-4" />
          </button>
        </div>
      </div>

      <BoardModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={{ title: board.title, background: board.background }}
        onSubmit={(values) => updateMutation.mutate(values)}
        isSubmitting={updateMutation.isPending}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the board <strong>{board.title}</strong> and all its content. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={() => deleteMutation.mutate()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Board"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
