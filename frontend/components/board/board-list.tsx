"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconDots, IconTrash, IconEdit, IconX } from "@tabler/icons-react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  const formRef = useRef<HTMLFormElement>(null);

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

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      setFocus("title");
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
    reset({ title: list.title }); // Reset to original value of the list
  };

  // Update List Mutation
  const { mutate: updateList, isPending: isUpdating } = useMutation({
    mutationFn: (newTitle: string) =>
      updateListAPI({
        boardId: params.id as string,
        payload: { id: list.id, title: newTitle },
      }),
    onSuccess: (newData) => {
      // toast.success(`Renamed to "${newData.payload.title}"`);
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
    <li className="shrink-0 h-full w-[272px] select-none">
      <div className="w-full rounded-md bg-[#f1f2f4] dark:bg-popover dark:text-popover-foreground shadow-md pb-2">
        {/* List Header */}
        <div className="pt-2 px-2 text-sm font-semibold flex justify-between items-start gap-x-2">
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
            <div
              onClick={enableEditing}
              className="w-full text-sm px-2.5 py-1 h-7 font-medium border-transparent cursor-pointer"
            >
              {list.title}
            </div>
          )}

          {/* List Actions Menu */}
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

        {/* Ticket List */}
        <div className="flex flex-col mx-1 px-1 py-0.5 min-h-[20px]">
          {ticketsByList.map((ticket) => (
            <Ticket key={ticket.id} ticketId={ticket.id} />
          ))}
        </div>

        {/* Add Ticket Form */}
        <CreateTicketForm listId={listId} />
      </div>
    </li>
  );
};
