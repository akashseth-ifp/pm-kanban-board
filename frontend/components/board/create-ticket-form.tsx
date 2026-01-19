"use client";

import { useState, useRef, ElementRef } from "react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { addTicketAPI } from "@/clientAPI/ticketEventAPI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAddTicketPosition } from "@/utils/board-position";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateTicketFormProps {
  listId: string;
  onTicketCreate?: () => void;
}

export const CreateTicketForm = ({
  listId,
  onTicketCreate,
}: CreateTicketFormProps) => {
  const params = useParams();
  const formRef = useRef<HTMLFormElement>(null);

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
      addTicketAPI({
        boardId: params.id as string,
        listId,
        payload: {
          title: values.title,
          position: getAddTicketPosition(listId),
        },
      }),
    onSuccess: () => {
      disableEditing();
    },
    onError: (error: any, variables) => {
      toast.error(error.message || "Failed to create ticket");
      enableEditing();
      reset({ title: variables.title });
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
    onTicketCreate?.();
    mutate(formData);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        ref={formRef}
        className="m-1 space-y-4 py-0.5 px-1"
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
          className="h-20 w-full border border-orange-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium text-foreground bg-background px-3 py-1 placeholder:text-muted-foreground resize-none"
          placeholder="Enter ticket content..."
          disabled={isPending}
        />
        <div className="flex items-center gap-x-1">
          <Button
            type="submit"
            loading={isPending}
            size="sm"
            variant="default"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Add Ticket
          </Button>
          <Button
            type="button"
            onClick={disableEditing}
            size="sm"
            variant="ghost"
            className="text-black hover:bg-black/10 dark:text-muted-foreground dark:hover:bg-white/10"
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="px-2">
      <Button
        onClick={enableEditing}
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-black dark:text-neutral-300 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/5 transition-colors py-5"
      >
        <IconPlus className="mr-2 h-4 w-4" />
        Add new ticket
      </Button>
    </div>
  );
};
