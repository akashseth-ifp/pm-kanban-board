"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteUserAPI } from "@/clientAPI/boardAPI";

const formSchema = z.object({
  email: z.email("Invalid email address"),
  role: z.enum(["Admin", "Member", "Viewer"]),
});

type FormData = z.infer<typeof formSchema>;

interface InviteMemberModalProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberModal({
  boardId,
  open,
  onOpenChange,
}: InviteMemberModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "Member",
    },
  });

  const { mutate: inviteUser, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      inviteUserAPI(boardId, data.email, data.role),
    retry: 0,
    networkMode: "online",
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  const onSubmit = (values: FormData) => {
    inviteUser(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Members</DialogTitle>
          <DialogDescription>
            Invite new members to collaborate on this board.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Invite new member
            </h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: { field: any }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Enter member email"
                            className="h-10 border-muted focus-visible:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }: { field: any }) => (
                        <FormItem className="flex-1">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 border-muted">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Member">Member</SelectItem>
                              <SelectItem value="Viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      loading={isPending}
                      className="bg-[#f06a24] hover:bg-[#d95d1f] text-white px-6 font-semibold transition-all shadow-sm active:scale-95 shrink-0"
                    >
                      Send Invite
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              New members will receive an email invitation to join this board.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
