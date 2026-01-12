"use client";

import Link from "next/link";
import {
  IconLayoutKanban,
  IconSettings,
  IconLogout,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useMutation } from "@tanstack/react-query";
import { signOutAPI } from "@/clientAPI/authAPI";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useTransitionRouter } from "next-view-transitions";

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useTransitionRouter();

  const { mutateAsync: signOut } = useMutation({
    mutationFn: () => signOutAPI(),
    onSuccess: () => {
      router.replace("/auth");
    },
    onError: (error) => {
      toast.error(`Failed to sign out: ${error.message}`);
    },
  });

  return (
    <nav className="h-[60px] border-b border-border bg-background text-foreground fixed top-0 right-0 left-0 z-50 shadow-md dark:shadow-black/50">
      <div className="w-full h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="bg-muted p-1.5 rounded-md text-foreground border border-border">
            <IconLayoutKanban size={20} className="stroke-[2.5]" />
          </div>
          <span className="font-bold text-lg tracking-tight">Kanban Board</span>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0 overflow-hidden border"
              >
                <img
                  src={
                    user?.image ||
                    `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user?.id}`
                  }
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-base font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>
                <IconSettings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20"
              >
                <IconLogout className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="border border-border"
          >
            <IconSun
              size={26}
              className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <IconMoon
              size={26}
              className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
