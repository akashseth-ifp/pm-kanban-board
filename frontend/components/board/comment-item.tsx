"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { IconEdit, IconTrash, IconX } from "@tabler/icons-react";
import { CommentWithUser } from "@backend/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useBoardDataStore from "@/store/boardData.store";
import {
  updateCommentAPI,
  deleteCommentAPI,
} from "@/clientAPI/commentEventAPI";
import { useSession } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentItemProps {
  comment: CommentWithUser;
  boardId: string;
}

export const CommentItem = ({ comment, boardId }: CommentItemProps) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isAuthor = session?.user?.id === comment.userId;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const updateCommentAction = useBoardDataStore((s) => s.updateComment);
  const deleteCommentAction = useBoardDataStore((s) => s.deleteComment);

  const { mutate: updateComment, isPending: isUpdating } = useMutation({
    mutationFn: () =>
      updateCommentAPI({
        boardId,
        payload: { id: comment.id, content: editContent },
      }),
    onSuccess: (updatedComment) => {
      setIsEditing(false);
      updateCommentAction(comment.id, comment.ticketId, updatedComment.payload);
      toast.success("Comment updated");
      queryClient.invalidateQueries({
        queryKey: ["ticket-comments", comment.ticketId],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update comment");
    },
  });

  const { mutate: deleteComment } = useMutation({
    mutationFn: () =>
      deleteCommentAPI({
        boardId,
        payload: { id: comment.id },
      }),
    onSuccess: () => {
      deleteCommentAction(comment.id, comment.ticketId);
      toast.success("Comment deleted");
      queryClient.invalidateQueries({
        queryKey: ["ticket-comments", comment.ticketId],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const onSave = () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }
    updateComment();
  };

  return (
    <div className="flex items-start gap-x-3">
      <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
        <img
          suppressHydrationWarning
          src={
            comment.user?.image ||
            `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${comment.user?.id}`
          }
          alt="Avatar"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <span className="text-sm font-semibold text-foreground">
              {comment.user?.name || "Unknown User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-[10px] text-muted-foreground">
                (edited)
              </span>
            )}
          </div>
          {isAuthor && !isEditing && (
            <div className="flex items-center gap-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Open menu</span>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground shadow-[4px_0_0_0_#94a3b8,-4px_0_0_0_#94a3b8]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <IconEdit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteComment()}
                    className="text-destructive focus:text-destructive"
                  >
                    <IconTrash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2 mt-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px] resize-none focus-visible:ring-primary"
            />
            <div className="flex items-center gap-x-2">
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={!editContent.trim() || isUpdating}
                loading={isUpdating}
              >
                Save changes
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-secondary/20 rounded-lg p-3 text-sm text-foreground/90 whitespace-pre-wrap">
            {comment.content}
          </div>
        )}
      </div>
    </div>
  );
};
