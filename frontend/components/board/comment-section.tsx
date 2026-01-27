"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconMessagePlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useBoardDataStore from "@/store/boardData.store";
import {
  addCommentAPI,
  getTicketCommentsAPI,
} from "@/clientAPI/commentEventAPI";
import { CommentItem } from "./comment-item";

interface CommentSectionProps {
  ticketId: string;
  boardId: string;
}

export const CommentSection = ({ ticketId, boardId }: CommentSectionProps) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const setTicketComments = useBoardDataStore(
    (state) => state.setTicketComments,
  );
  const commentsByTicketId = useBoardDataStore(
    (state) => state.commentsByTicketId,
  );
  const ticketComments = commentsByTicketId[ticketId] || [];

  const { data, isLoading } = useQuery({
    queryKey: ["ticket-comments", ticketId],
    queryFn: () => getTicketCommentsAPI({ boardId, ticketId }),
    enabled: !!ticketId && !!boardId,
  });

  useEffect(() => {
    if (data) {
      setTicketComments(ticketId, data);
    }
  }, [data, ticketId, setTicketComments]);

  const sortedComments = [...ticketComments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: () =>
      addCommentAPI({
        boardId,
        ticketId,
        payload: { content },
      }),
    onSuccess: () => {
      setContent("");
      toast.success("Comment added");
      queryClient.invalidateQueries({
        queryKey: ["ticket-comments", ticketId],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add comment");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-x-3">
        <IconMessagePlus className="h-5 w-5 mt-0.5 text-muted-foreground" />
        <div className="flex-1 space-y-3">
          <h3 className="font-semibold text-foreground">Activity</h3>
          <div className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  if (!content.trim() || isPending) return;
                  addComment();
                }
              }}
              className="min-h-[80px] w-full resize-none focus-visible:ring-primary"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  if (!content.trim()) return;
                  addComment();
                }}
                size="sm"
                disabled={!content.trim() || isPending}
                loading={isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="text-sm text-muted-foreground animate-pulse pl-10">
            Loading comments...
          </div>
        )}
        {!isLoading && sortedComments.length === 0 && (
          <div className="text-sm text-muted-foreground pl-10">
            No activity yet.
          </div>
        )}
        {sortedComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} boardId={boardId} />
        ))}
      </div>
    </div>
  );
};
