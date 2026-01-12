"use client";

import { useState, useRef } from "react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { addListAPI } from "@/clientAPI/listEventAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAddListPosition } from "@/utils/board-position";
import useBoardOrderStore from "@/store/boardOrder.store";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
});

type FormData = z.infer<typeof formSchema>;

export const CreateListForm = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const addList = useBoardOrderStore((state) => state.addList);

  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setFocus,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
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
    reset();
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormData) =>
      addListAPI({
        boardId: params.id as string,
        payload: { title: values.title, position: getAddListPosition() },
      }),
    onSuccess: () => {
      toast.success("List created");
      disableEditing();
      queryClient.invalidateQueries({ queryKey: ["lists", params.id] });
      // addList({
      //   id: "",
      //   position: getAddListPosition(),
      // });
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
    mutate(formData);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        ref={formRef}
        className="w-full rounded-md bg-white dark:bg-popover dark:text-popover-foreground p-3 shadow-md transition-[height]"
      >
        <Input
          id="title"
          {...register("title")}
          className="h-10 w-full border border-input focus-visible:ring-1 focus-visible:ring-ring text-sm font-medium text-foreground bg-background px-3 py-1 placeholder:text-muted-foreground"
          placeholder="Enter list title..."
          disabled={isPending}
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
            type="button"
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
      className="flex w-full items-center rounded-md bg-[#f1f2f4] dark:bg-popover p-3 text-sm font-medium transition hover:bg-[#e4e6e9] dark:hover:bg-popover/80 text-foreground shadow-md"
    >
      <IconPlus className="mr-2 h-4 w-4" />
      Add another list
    </button>
  );
};
