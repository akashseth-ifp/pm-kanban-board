"use client";

import { useState, useRef, ElementRef } from "react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconPlus, IconX } from "@tabler/icons-react";

import { addListAPI } from "@/clientAPI/listEventAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const CreateListForm = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const [isEditing, setIsEditing] = useState(false);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (title: string) =>
      addListAPI({
        boardId: params.id as string,
        payload: { title, position: 0 }, // Position will be handled by backend or logic
      }),
    onSuccess: () => {
      toast.success("List created");
      disableEditing();
      queryClient.invalidateQueries({ queryKey: ["lists", params.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create list");
    },
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef as React.RefObject<HTMLElement>, disableEditing);

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;

    if (!title) {
      disableEditing();
      return;
    }

    mutate(title);
  };

  if (isEditing) {
    return (
      <form
        action={onSubmit}
        ref={formRef}
        className="w-full rounded-md bg-white dark:bg-popover dark:text-popover-foreground p-3 shadow-md transition-[height]"
      >
        <Input
          ref={inputRef}
          id="title"
          name="title"
          className="h-10 w-full border border-input focus-visible:ring-1 focus-visible:ring-ring text-sm font-medium text-foreground bg-background px-3 py-1 placeholder:text-muted-foreground"
          placeholder="Enter list title..."
        />
        <div className="mt-3 flex items-center gap-x-1">
          <Button
            type="submit"
            disabled={isPending}
            size="sm"
            variant="default"
          >
            Add List
          </Button>
          <Button
            onClick={disableEditing}
            size="sm"
            variant="ghost"
            className="text-black hover:bg-black/10 dark:text-popover-foreground dark:hover:bg-white/10"
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={enableEditing}
      className="flex w-full items-center rounded-md bg-white/80 p-3 text-sm font-medium transition hover:bg-white/50 text-black/70 hover:text-black dark:bg-black/40 dark:text-white dark:hover:bg-black/60"
    >
      <IconPlus className="mr-2 h-4 w-4" />
      Add another list
    </button>
  );
};
