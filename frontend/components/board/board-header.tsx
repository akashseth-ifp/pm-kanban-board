"use client";

import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "next-view-transitions";

import { useState } from "react";
import { InviteMemberModal } from "./invite-member-modal";

interface BoardHeaderProps {
  title: string;
  boardId: string;
}

export const BoardHeader = ({ title, boardId }: BoardHeaderProps) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <div className="flex h-14 items-center gap-4 bg-muted/20 px-6 text-foreground border-b border-border backdrop-blur-sm">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-muted transition-colors"
      >
        <Link href="/app/dashboard">
          <IconArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="ml-auto">
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          variant="outline"
          size="sm"
          className="font-medium bg-[#f06a24] text-white hover:bg-[#d95d1f] hover:text-white border-none shadow-sm transition-all active:scale-95"
        >
          Members
        </Button>
      </div>

      <InviteMemberModal
        boardId={boardId}
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
      />
    </div>
  );
};
