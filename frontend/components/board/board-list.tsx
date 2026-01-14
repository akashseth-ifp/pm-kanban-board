"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconDots, IconTrash, IconEdit, IconX } from "@tabler/icons-react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  dropTargetForElements,
  draggable,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";
import { updateListAPI, deleteListAPI } from "@/clientAPI/listEventAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import useBoardDataStore from "@/store/boardData.store";
import { Ticket } from "./ticket";
import { CreateTicketForm } from "./create-ticket-form";
import useBoardOrderStore from "@/store/boardOrder.store";
import { DropIndicator } from "./drop-indicator";

interface BoardListProps {
  listId: string;
  index: number;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type FormData = z.infer<typeof formSchema>;

export const BoardList = ({ listId, index }: BoardListProps) => {
  const params = useParams();
  const list = useBoardDataStore((state) => state.listsById[listId]);
  const ticketsByList = useBoardOrderStore(
    (state) => state.ticketOrderByList[listId]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const ticketListRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLLIElement>(null);
  const [ticketClosestEdge, setTicketClosestEdge] = useState<Edge | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: list.title,
    },
  });

  // Set up drop target for tickets AND list reordering
  useEffect(() => {
    const element = listRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.type === "list",
      getData: ({ input, element }) => {
        const data = { type: "list", listId, index };
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ["left", "right"],
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
  }, [listId, index]);

  // Set up drop target for tickets within this list and auto-scroll
  useEffect(() => {
    const element = ticketListRef.current;
    if (!element) return;

    return combine(
      dropTargetForElements({
        element,
        canDrop: ({ source }) => source.data.type === "ticket",
        getData: () => ({ type: "list-ticket-area", listId }),
        onDragEnter: () => {
          // IMPORTANT: Only use the area indicator if the list is TRULY empty.
          // For non-empty lists, cards handle their own boundaries.
          if (ticketsByList.length === 0) {
            setTicketClosestEdge("top");
          }
        },
        onDrag: () => {
          if (ticketsByList.length === 0) {
            setTicketClosestEdge("top");
          } else {
            setTicketClosestEdge(null);
          }
        },
        onDragLeave: () => setTicketClosestEdge(null),
        onDrop: () => setTicketClosestEdge(null),
      }),
      autoScrollForElements({
        element,
      })
    );
  }, [listId, ticketsByList.length]); // Track length to avoid stale closure

  // Scroll to bottom when a new ticket is added
  const prevTicketsCount = useRef(ticketsByList.length);
  const shouldScrollToBottomRef = useRef(false);

  useEffect(() => {
    if (ticketsByList.length > prevTicketsCount.current) {
      if (shouldScrollToBottomRef.current) {
        ticketListRef.current?.scrollTo({
          top: ticketListRef.current.scrollHeight,
          behavior: "smooth",
        });
        shouldScrollToBottomRef.current = false;
      }
    }
    prevTicketsCount.current = ticketsByList.length;
  }, [ticketsByList.length]);

  // Set up draggable for list
  useEffect(() => {
    const element = listRef.current;
    if (!element || isEditing) return;

    return draggable({
      element,
      getInitialData: () => ({
        type: "list",
        listId,
        index,
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
            // Remove hover rings and fix height to avoid trailing whitespace
            clone.classList.remove("hover:ring-1", "hover:ring-primary");

            // Remove DropIndicator artifacts from the drag preview
            const dropIndicators = clone.querySelectorAll(
              '[data-drop-indicator="true"]'
            );
            dropIndicators.forEach((indicator) => indicator.remove());

            clone.style.height = "auto";
            clone.style.maxHeight = "90vh";
            clone.style.width = `${element.offsetWidth}px`;
            clone.style.opacity = "1";
            clone.style.borderRadius = "12px";
            clone.style.backgroundColor = "transparent";
            clone.style.boxShadow = "none";
            clone.style.overflow = "hidden";
            clone.style.margin = "0";
            clone.style.transform = "none";
            clone.style.top = "0";
            clone.style.left = "0";

            // Apply styles to the actual list content container
            const listContent = clone.querySelector(
              ".shadow-md"
            ) as HTMLElement;
            if (listContent) {
              listContent.style.borderRadius = "12px";
              listContent.style.boxShadow = "0px 15px 40px rgba(0,0,0,0.2)";
            }

            container.appendChild(clone);
          },
        });
      },
    });
  }, [listId, index, isEditing]);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      setFocus("title");
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
    reset({ title: list.title });
  };

  // Update List Mutation
  const { mutate: updateList, isPending: isUpdating } = useMutation({
    mutationFn: (newTitle: string) =>
      updateListAPI({
        boardId: params.id as string,
        payload: { id: list.id, title: newTitle },
      }),
    onSuccess: (newData) => {
      reset({ title: newData.payload.title });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update list");
      reset({ title: list.title });
    },
  });

  // Delete List Mutation
  const { mutate: deleteList } = useMutation({
    mutationFn: () =>
      deleteListAPI({
        boardId: params.id as string,
        payload: { id: list.id },
      }),
    onSuccess: () => {
      toast.success("List deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete list");
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
    if (data.title === list.title) {
      disableEditing();
      return;
    }
    updateList(data.title);
  };

  return (
    <li
      ref={listRef}
      className={`shrink-0 w-[272px] select-none transition-opacity relative outline-none ring-0 rounded-lg ${
        isDragging ? "opacity-30 h-fit" : "h-full"
      }`}
    >
      <DropIndicator edge={closestEdge} gap={12} />
      <div className="w-full flex flex-col rounded-md bg-[#f1f2f4] dark:bg-popover dark:text-popover-foreground shadow-md max-h-full">
        {/* List Header */}
        <div className="pt-2 px-2 text-sm font-semibold flex justify-between items-start gap-x-2 shrink-0">
          {isEditing ? (
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit)}
              className="flex-1 px-[2px]"
            >
              <Input
                id="title"
                {...register("title")}
                className="h-10 w-full border-input focus-visible:ring-1 focus-visible:ring-ring mb-2 bg-background px-2"
                placeholder="Enter list title..."
              />
              <div className="flex items-center gap-x-1">
                <Button
                  type="submit"
                  size="sm"
                  variant="default"
                  loading={isUpdating}
                >
                  Update List
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
          ) : (
            <div className="w-full text-sm px-2.5 py-1 h-7 font-medium border-transparent">
              {list.title}
            </div>
          )}

          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-auto w-auto p-2 dark:text-white"
                >
                  <IconDots className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom">
                <DropdownMenuItem onClick={enableEditing}>
                  <IconEdit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteList()}
                  className="text-destructive focus:text-destructive"
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Ticket List Area - scrollable */}
        <div
          ref={ticketListRef}
          className={`flex-1 flex flex-col px-2 py-2 overflow-y-auto relative min-h-[4px]`}
        >
          {ticketsByList.map((ticket, idx) => (
            <Ticket
              key={ticket.id}
              ticketId={ticket.id}
              index={idx}
              listId={listId}
            />
          ))}
          <DropIndicator edge={ticketClosestEdge} gap={-12} />
        </div>

        {/* Add Ticket Form */}
        <div className="shrink-0 pb-2">
          <CreateTicketForm
            listId={listId}
            onTicketCreate={() => {
              shouldScrollToBottomRef.current = true;
            }}
          />
        </div>
      </div>
    </li>
  );
};
