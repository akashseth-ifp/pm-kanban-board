"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ticket } from "@backend/schema/ticket.schema";
import { updateTicketAPI } from "@/clientAPI/ticketEventAPI";
import {
  IconCircle,
  IconProgress,
  IconEye,
  IconBan,
  IconCheck,
  IconArchive,
} from "@tabler/icons-react";

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

const ticketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  priority: z.enum(["Critical", "High", "Medium", "Low"]),
  status: z.enum([
    "Backlog",
    "Todo",
    "In Progress",
    "In Review",
    "Blocked",
    "Done",
  ]),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface EditTicketModalProps {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditTicketModal = ({
  ticket,
  open,
  onOpenChange,
}: EditTicketModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: ticket.title,
      description: ticket.description || "",
      priority: (ticket.priority as any) || "Low",
      status: (ticket.status as any) || "Todo",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: ticket.title,
        description: ticket.description || "",
        priority: (ticket.priority as any) || "Low",
        status: (ticket.status as any) || "Todo",
      });
    }
  }, [open, ticket, reset]);

  const { mutate: updateTicket, isPending } = useMutation({
    mutationFn: (values: TicketFormValues) =>
      updateTicketAPI({
        boardId: ticket.boardId,
        listId: ticket.listId,
        payload: {
          id: ticket.id,
          title: values.title,
          description: values.description || undefined,
          priority: values.priority,
          status: values.status,
        },
      }),
    onSuccess: () => {
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update ticket");
    },
  });

  const onFormSubmit = (values: TicketFormValues) => {
    updateTicket(values);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader className="items-start text-left">
          <AlertDialogTitle>Edit Ticket</AlertDialogTitle>
          <AlertDialogDescription>
            Update the details of this ticket.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                placeholder="Ticket Title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-destructive text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Add a more detailed description..."
                className="min-h-[100px]"
                {...register("description")}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Priority</FieldLabel>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                PRIORITY_COLORS[field.value]
                              }`}
                            />
                            {field.value}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_COLORS).map(([p, color]) => (
                          <SelectItem key={p} value={p}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${color}`}
                              />
                              {p}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Status</FieldLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status">
                          <div className="flex items-center gap-2">
                            {STATUS_ICONS[field.value] &&
                              React.createElement(STATUS_ICONS[field.value], {
                                className: "h-4 w-4 text-muted-foreground",
                              })}
                            {field.value}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_ICONS).map(([s, Icon]) => (
                          <SelectItem key={s} value={s}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              {s}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
          </FieldGroup>
          <AlertDialogFooter className="sm:justify-between">
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
