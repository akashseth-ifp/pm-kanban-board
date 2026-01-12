"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBoardAPI, deleteBoardAPI } from "@/clientAPI/boardEventAPI";
import { BoardModal } from "./create-board-modal"; // Note: renamed file in later step or rename export
import { gradientBackgrounds } from "@/lib/utils";
import { IconExternalLink, IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { Link } from "next-view-transitions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Board as BoardType } from "@backend/schema/board.schema";
import { UpdateBoardEvent } from "@backend/boardEvents/updateBoard.event";

interface IProps {
  board: BoardType;
}

export const Board = ({ board }: IProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const queryClient = useQueryClient();

  // 1. Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateBoardEvent["payload"]) =>
      updateBoardAPI({ payload: data, boardId: board.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update board");
    },
  });

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteBoardAPI({ boardId: board.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setIsDeleteOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete board");
    },
  });

  return (
    <>
      <div className="group relative flex h-32 flex-col justify-between rounded-lg p-4 shadow-sm transition-transform hover:scale-[1.02] bg-muted/30 border border-border overflow-hidden cursor-pointer">
        {/* Main Link (covers entire card except where buttons are) */}
        <Link
          href={`/app/board/${board.id}`}
          className="absolute inset-0 z-[1]"
        >
          <span className="sr-only">Open {board.title}</span>
        </Link>

        {/* Header content (z-0, clicks pass to link) */}
        <div className="relative z-0 flex items-start justify-between pointer-events-none">
          <h3 className="font-semibold text-foreground truncate">
            {board.title}
          </h3>
          <IconExternalLink className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Actions (z-[2], clickable above the link) */}
        <div className="relative z-[2] flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/50 backdrop-blur-md hover:bg-background hover:text-foreground border border-border"
            onClick={(e) => {
              e.preventDefault();
              setIsEditModalOpen(true);
            }}
          >
            <IconEdit className="size-4" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/50 backdrop-blur-md hover:bg-background hover:text-destructive border border-border"
            onClick={(e) => {
              e.preventDefault();
              setIsDeleteOpen(true);
            }}
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      </div>

      <BoardModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={{ title: board.title }}
        onSubmit={(values) => {
          updateMutation.mutate({ title: values.title });
        }}
        isSubmitting={updateMutation.isPending}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the board{" "}
              <strong>{board.title}</strong> and all its content. This action
              cannot be undone.
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
  );
};
