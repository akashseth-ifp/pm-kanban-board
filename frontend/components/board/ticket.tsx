"use client";

import { useState, useRef, useEffect, memo } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  IconDots,
  IconTrash,
  IconEdit,
  IconX,
  IconCircle,
  IconProgress,
  IconEye,
  IconBan,
  IconCheck,
  IconArchive,
} from "@tabler/icons-react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { updateTicketAPI, deleteTicketAPI } from "@/clientAPI/ticketEventAPI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import useBoardDataStore from "@/store/boardData.store";
import { Badge } from "@/components/ui/badge";
import { EditTicketModal } from "./edit-ticket-modal";
import { DropIndicator } from "./drop-indicator";
import { getTicketIndex } from "@/utils/board-position";

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-blue-500",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  Backlog: IconArchive,
  Todo: IconCircle,
  "In Progress": IconProgress,
  "In Review": IconEye,
  Blocked: IconBan,
  Done: IconCheck,
};

interface TicketProps {
  ticketId: string;
  listId: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type FormData = z.infer<typeof formSchema>;

export const Ticket = memo(({ ticketId, listId }: TicketProps) => {
  const ticket = useBoardDataStore((state) => state.ticketsById[ticketId]);
  console.log("Rendering ticket : ", listId, ticketId, ticket.title);

  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const dropTargetRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: ticket?.title || "",
    },
  });

  // Set up drag and drop
  useEffect(() => {
    const element = ticketRef.current;
    if (!element || isEditing) return;

    return draggable({
      element,
      getInitialData: () => ({
        type: "ticket",
        ticketId,
        listId,
        index: getTicketIndex(listId, ticketId),
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
      onGenerateDragPreview: ({ nativeSetDragImage, location }) => {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset: ({ container }) => {
            const rect = element.getBoundingClientRect();
            const x = location.initial.input.clientX - rect.left;
            const y = location.initial.input.clientY - rect.top;
            return { x, y };
          },
          render({ container }) {
            const clone = element.cloneNode(true) as HTMLElement;
            clone.classList.remove(
              "hover:ring-1",
              "hover:ring-primary",
              "hover:ring-2",
              "hover:ring-blue-400"
            );
            clone.style.width = `${element.offsetWidth}px`;
            clone.style.transform = "rotate(2deg)";
            clone.style.boxShadow = "none";
            clone.style.opacity = "0.9";
            container.appendChild(clone);
          },
        });
      },
    });
  }, [ticketId, listId, isEditing]);

  // Set up drop target for ticket reordering
  useEffect(() => {
    const element = dropTargetRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.type === "ticket",
      getData: ({ input, element }) => {
        const data = {
          type: "ticket",
          ticketId,
          listId,
          index: getTicketIndex(listId, ticketId),
        };
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ["top", "bottom"],
        });
      },
      onDragEnter: ({ self }) => {
        const edge = extractClosestEdge(self.data);
        setClosestEdge(edge);
      },
      onDrag: ({ self }) => {
        const edge = extractClosestEdge(self.data);
        setClosestEdge(edge);
      },
      onDragLeave: () => setClosestEdge(null),
      onDrop: () => setClosestEdge(null),
    });
  }, [ticketId, listId]);

  const enableEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => {
      setFocus("title");
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
    reset({ title: ticket?.title || "" });
  };

  const { mutate: updateTicket, isPending: isUpdating } = useMutation({
    mutationFn: (newTitle: string) =>
      updateTicketAPI({
        boardId: ticket.boardId,
        payload: { id: ticket.id, title: newTitle },
        listId: ticket.listId,
      }),
    onSuccess: () => {
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update ticket");
      reset({ title: ticket.title });
    },
  });

  const { mutate: deleteTicket } = useMutation({
    mutationFn: () =>
      deleteTicketAPI({
        boardId: ticket.boardId,
        payload: { id: ticket.id },
        listId: ticket.listId,
      }),
    onSuccess: () => {
      toast.success("Ticket deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete ticket");
    },
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef as React.RefObject<HTMLElement>, disableEditing);

  const onSubmit = (data: FormData) => {
    if (!ticket || data.title === ticket.title) {
      disableEditing();
      return;
    }
    updateTicket(data.title);
  };

  if (!ticket) return null;

  if (isEditing) {
    return (
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full px-1 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Textarea
          id="title"
          {...register("title")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
          className="h-20 w-full border-orange-500 focus-visible:ring-base bg-background px-2 resize-none"
          placeholder="Enter ticket title..."
        />
        <div className="flex items-center gap-x-1 mt-2">
          <Button
            type="submit"
            size="sm"
            variant="default"
            loading={isUpdating}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Update Ticket
          </Button>
          <Button
            type="button"
            onClick={disableEditing}
            size="sm"
            variant="ghost"
            className="px-2"
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }

  const StatusIcon = ticket.status ? STATUS_ICONS[ticket.status] : IconCircle;

  return (
    <>
      <div
        ref={dropTargetRef}
        id={`ticket-card-${ticketId}`}
        className="relative py-[6px]" // 6px top + 6px bottom = 12px gap
      >
        <DropIndicator edge={closestEdge} gap={0} />
        <div
          ref={ticketRef}
          onClick={() => setIsModalOpen(true)}
          className={`group flex flex-col bg-white dark:bg-[#22272b] dark:text-popover-foreground rounded-md shadow-sm p-3 transition-all cursor-grab active:cursor-grabbing space-y-3 outline-none ring-0 ${
            isDragging
              ? "opacity-30"
              : "hover:ring-1 hover:ring-primary hover:bg-primary/[0.02]"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="text-sm font-medium w-full truncate pr-1">
              {ticket.title}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto w-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IconDots className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={enableEditing}>
                    <IconEdit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => deleteTicket()}
                    className="text-destructive focus:text-destructive"
                  >
                    <IconTrash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ticket.status && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0 h-5 text-[10px] font-semibold bg-secondary/30 text-secondary-foreground flex items-center gap-1 border-none shadow-none"
                >
                  {StatusIcon && <StatusIcon className="h-3 w-3" />}
                  {ticket.status}
                </Badge>
              )}
            </div>

            {ticket.priority && (
              <div className="flex items-center gap-1.5">
                <div
                  className={`h-2 w-2 rounded-full ${
                    PRIORITY_COLORS[ticket.priority] || "bg-gray-400"
                  } shadow-sm`}
                />
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                  {ticket.priority}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <EditTicketModal
        ticket={ticket}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
});
