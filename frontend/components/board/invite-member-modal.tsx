"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  inviteUserAPI,
  getBoardMembersAPI,
  deleteBoardMemberAPI,
  updateBoardMemberRoleAPI,
} from "@/clientAPI/boardAPI";
import { IconTrash, IconX } from "@tabler/icons-react";
import { useSession } from "@/lib/auth-client";
import useBoardDataStore from "@/store/boardData.store";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
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
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user;
  const currentUserId = user?.id;

  // Get board owner ID from store
  const board = useBoardDataStore((state) => state.boardData);
  const boardOwnerId = board?.userId;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "Member",
    },
  });

  // Fetch members
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["board-members", boardId],
    queryFn: () => getBoardMembersAPI(boardId),
    enabled: open,
  });

  const currentUserMember = membersData?.activeMembers.find(
    (m) => m.user.id === currentUserId
  );
  const isOwner = boardOwnerId === currentUserId;
  const isAdmin = currentUserMember?.role === "Admin" || isOwner;

  // Invite user mutation
  const { mutate: inviteUser, isPending: isInviting } = useMutation({
    mutationFn: (data: FormData) =>
      inviteUserAPI(boardId, data.email, data.role),
    retry: 0,
    networkMode: "online",
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["board-members", boardId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  // Delete member mutation
  const { mutate: deleteMember } = useMutation({
    mutationFn: (memberId: string) => deleteBoardMemberAPI(boardId, memberId),
    onSuccess: () => {
      toast.success("Member removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["board-members", boardId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove member");
    },
  });

  // Update role mutation
  const { mutate: updateRole } = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      updateBoardMemberRoleAPI(boardId, memberId, role),
    onSuccess: () => {
      toast.success("Role updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["board-members", boardId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update role");
    },
  });

  const onSubmit = (values: FormData) => {
    inviteUser(values);
  };

  const canRemoveMember = (memberRole: string, memberUserId: string) => {
    if (memberUserId === currentUserId) return false;
    if (isOwner) return true;
    if (isAdmin && memberRole !== "Admin") return true;
    return false;
  };

  const canChangeRole = (memberUserId: string) => {
    if (memberUserId === currentUserId) return false;
    return isOwner || isAdmin;
  };

  const getAvailableRoles = () => {
    if (isOwner) return ["Admin", "Member", "Viewer"];
    if (isAdmin) return ["Member", "Viewer"];
    return [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isAdmin ? "Members" : "Board Members"}
          </DialogTitle>
          <DialogDescription>
            {isAdmin
              ? "Invite new members to collaborate on this board."
              : "View all members of this board."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Invite Form */}
          {isAdmin && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Invite new member
              </h3>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: { field: any }) => (
                      <FormItem>
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
                              {isOwner && (
                                <SelectItem value="Admin">Admin</SelectItem>
                              )}
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
                      loading={isInviting}
                      className="bg-[#f06a24] hover:bg-[#d95d1f] text-white px-6 font-semibold transition-all shadow-sm active:scale-95 shrink-0"
                    >
                      Send Invite
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Pending Invites */}
          {isAdmin && membersData && membersData.pendingInvites.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Invite
              </h3>
              <div className="space-y-2">
                {membersData.pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <span className="text-sm text-muted-foreground">
                      {invite.email}
                    </span>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => deleteMember(invite.id)}
                    >
                      <IconX className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member List */}
          {membersData && membersData.activeMembers.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Active Members
              </h3>
              <div className="space-y-2">
                {membersData.activeMembers.map((member) => {
                  const isCurrentUser = member.user.id === currentUserId;
                  const isBoardOwner = member.user.id === boardOwnerId;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {member.user.name}
                            {isCurrentUser && (
                              <span className="text-muted-foreground ml-1">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {canChangeRole(member.user.id) && !isBoardOwner ? (
                          <Select
                            value={member.role}
                            onValueChange={(newRole) =>
                              updateRole({ memberId: member.id, role: newRole })
                            }
                          >
                            <SelectTrigger className="w-[110px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableRoles().map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              member.role === "Admin"
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : member.role === "Member"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {member.role}
                          </span>
                        )}

                        {canRemoveMember(member.role, member.user.id) &&
                          !isBoardOwner && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => deleteMember(member.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <IconTrash className="size-4" />
                            </Button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading members...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
