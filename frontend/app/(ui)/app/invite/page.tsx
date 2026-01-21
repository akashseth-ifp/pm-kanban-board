"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { acceptInviteAPI } from "@/clientAPI/boardAPI";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const boardTitle = searchParams.get("board");
  const { data: session, isPending: isSessionLoading } = useSession();

  const { mutate, isPending: isAccepting } = useMutation({
    mutationFn: acceptInviteAPI,
    retry: 0,
    networkMode: "online",
    onSuccess: (data) => {
      toast.success("Invitation accepted successfully!");
      router.replace(`board/${data.boardId}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept invitation"
      );
    },
  });

  const handleAcceptInvite = () => {
    if (token) {
      mutate(token);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-60px)] w-full items-center justify-center p-6">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[calc(100dvh-60px)] w-full flex-col items-center justify-center gap-4 text-center p-6">
        <h1 className="text-2xl font-bold text-destructive">
          Invite token is missing
        </h1>
        <p className="text-muted-foreground">
          Please check your email for the correct invitation link.
        </p>
        <Button onClick={() => router.push("/app")}>Go to Dashboard</Button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[calc(100dvh-60px)] w-full flex-col items-center justify-center gap-4 text-center p-6">
        <h1 className="text-2xl font-bold">
          You are invited to join{" "}
          {boardTitle ? (
            <span className="text-primary">{boardTitle}</span>
          ) : (
            "a board"
          )}
          !
        </h1>
        <p className="text-muted-foreground max-w-md">
          Please login or create an account to accept the invitation and start
          collaborating.
        </p>
        <Button
          onClick={() => {
            const redirectPath = `/app/invite?token=${token}${
              boardTitle ? `&board=${boardTitle}` : ""
            }`;
            router.push(`/auth?redirectTo=${encodeURIComponent(redirectPath)}`);
          }}
        >
          Login to Accept Invite
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-60px)] w-full flex-col items-center justify-center gap-6 text-center p-6">
      <div className="space-y-4 max-w-lg">
        <h1 className="text-3xl font-bold sm:text-4xl">
          {boardTitle ? `Join ${boardTitle}` : "Board Invitation"}
        </h1>
        <p className="text-muted-foreground text-lg">
          You have been invited to collaborate{" "}
          {boardTitle ? "on this board" : "on a board"}. Click below to accept
          and join.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          size="lg"
          onClick={handleAcceptInvite}
          disabled={isAccepting}
          className="w-full font-semibold h-12 text-base"
        >
          {isAccepting ? (
            <>
              <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
              Accepting...
            </>
          ) : (
            "Accept Invitation"
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="h-12"
        >
          Ignore
        </Button>
      </div>

      <p className="text-sm text-muted-foreground pt-4">
        Signed in as{" "}
        <span className="font-medium text-foreground">
          {session.user.email}
        </span>
      </p>
    </div>
  );
}
