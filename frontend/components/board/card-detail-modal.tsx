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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ticket } from "@backend/schema/ticket.schema";
import { updateTicketAPI } from "@/clientAPI/ticketEventAPI";
import {
  IconCircle,
  IconProgress,
  IconEye,
  IconBan,
  IconCheck,
  IconArchive,
  IconLayout,
  IconX,
  IconAlignLeft,
  IconList,
  IconUser,
  IconPaperclip,
} from "@tabler/icons-react";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

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

export const CardDetailModal = ({
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
    setValue,
    watch,
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

  const description = watch("description");

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
      toast.success("Card updated");
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
      <AlertDialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-[#F1F2F4] dark:bg-[#1d2125]">
        <AlertDialogTitle className="sr-only">Edit Ticket</AlertDialogTitle>
        {/* Header Image / Cover would go here */}

        <div className="flex-1 overflow-y-auto w-full">
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex flex-col h-full"
          >
            <div className="sticky top-0 z-10 bg-[#F1F2F4] dark:bg-[#1d2125] p-6 pb-2">
              <div className="flex items-start gap-4 mb-4">
                <IconLayout className="w-6 h-6 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <Input
                    id="title"
                    className="text-xl font-bold bg-transparent border-transparent px-2 -ml-2 h-auto focus-visible:bg-background focus-visible:border-input"
                    {...register("title")}
                  />
                  <p className="text-sm text-muted-foreground ml-2 mt-1">
                    in list{" "}
                    <span className="underline decoration-1 cursor-pointer">
                      Ticket List
                    </span>
                    {/* We don't have list name easily available here without fetching or prob drilling, assuming text for now or just generic */}
                  </p>
                </div>
                <AlertDialogCancel className="border-none bg-transparent hover:bg-black/10 dark:hover:bg-white/10 w-8 h-8 p-0 flex items-center justify-center rounded-sm text-muted-foreground">
                  <IconX className="w-5 h-5" />
                </AlertDialogCancel>
              </div>
            </div>

            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8">
              {/* Main Content */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <IconAlignLeft className="w-6 h-6 -ml-0.5 text-muted-foreground" />
                    <h3 className="font-semibold text-base">Description</h3>
                  </div>
                  <div className="pl-10">
                    <TiptapEditor
                      content={description || ""}
                      onChange={(val) => {
                        console.log(val);
                        setValue("description", val, { shouldDirty: true });
                      }}
                    />
                  </div>
                </div>

                {/* Activity / Comments Placeholder */}
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <IconList className="w-6 h-6 -ml-0.5 text-muted-foreground" />
                    <h3 className="font-semibold text-base">Activity</h3>
                  </div>
                  <div className="pl-10 flex gap-3">
                    {/* Avatar placeholder */}
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                      AS
                    </div>
                    <div className="flex-1">
                      <div className="bg-background rounded-md border shadow-sm p-3 text-sm text-muted-foreground">
                        Write a comment...
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Add to card
                  </span>
                  <div className="flex flex-col gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          className="justify-start h-8 px-2 w-full text-sm font-normal bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 shadow-none border-none"
                        >
                          <IconUser className="w-4 h-4 mr-2" /> Members
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                              AS
                            </div>
                            <span>Akash Seth</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-700">
                              JD
                            </div>
                            <span>John Doe</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-[10px] font-bold text-green-700">
                              JS
                            </div>
                            <span>Jane Smith</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="secondary"
                      className="justify-start h-8 px-2 w-full text-sm font-normal bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 shadow-none border-none"
                    >
                      <IconPaperclip className="w-4 h-4 mr-2" /> Attachment
                    </Button>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Actions
                  </span>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Status
                      </label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full bg-black/5 dark:bg-white/10 border-none h-8">
                              <SelectValue placeholder="Status" />
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
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Priority
                      </label>
                      <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full bg-black/5 dark:bg-white/10 border-none h-8">
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PRIORITY_COLORS).map(
                                ([p, color]) => (
                                  <SelectItem key={p} value={p}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`h-2 w-2 rounded-full ${color}`}
                                      />
                                      {p}
                                    </div>
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pt-2 mt-auto border-t bg-background flex justify-end gap-2 sticky bottom-0">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
