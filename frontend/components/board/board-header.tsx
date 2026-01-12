"use client";

import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

interface BoardHeaderProps {
  title: string;
  boardId: string;
}

export const BoardHeader = ({ title, boardId }: BoardHeaderProps) => {
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
        <Button variant="outline" size="sm" className="font-medium">
          Members
        </Button>
      </div>
    </div>
  );
};
