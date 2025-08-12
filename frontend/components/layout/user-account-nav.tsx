"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Check,
  LayoutDashboard,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Drawer } from "vaul";

import { signOut, useSession } from "@/lib/auth-client";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";

export function UserAccountNav() {
  const { data: session } = useSession();
  const user = session?.user;

  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    await signOut({
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("You’ve logged out. See you soon!");
          setIsPending(false);
          redirect("/login");
        },
      },
    });
  }

  const [open, setOpen] = useState(false);
  const closeDrawer = () => {
    setOpen(false);
  };
  const { theme, setTheme } = useTheme();

  const { isMobile } = useMediaQuery();

  if (!user)
    return (
      <div className="bg-muted size-8 animate-pulse rounded-full border" />
    );

  if (isMobile) {
    return (
      <Drawer.Root open={open} onClose={closeDrawer}>
        <Drawer.Trigger onClick={() => setOpen(true)}>
          <UserAvatar
            user={{
              name: user.name as string,
              username: user.username || null,
              image: user.image || null,
            }}
            className="size-9 border"
          />
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay
            className="bg-background/80 fixed inset-0 z-40 h-full backdrop-blur-xs"
            onClick={closeDrawer}
          />
          <Drawer.Content className="bg-background fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-[10px] border px-3 text-sm">
            <div className="sticky top-0 z-20 flex w-full items-center justify-center bg-inherit">
              <div className="bg-muted-foreground/20 my-3 h-1.5 w-16 rounded-full" />
            </div>

            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col">
                {user.name && <p className="font-medium">{user.name}</p>}
                {user.email && (
                  <p className="text-muted-foreground w-[200px] truncate">
                    {user?.email}
                  </p>
                )}
              </div>
            </div>

            <ul role="list" className="text-muted-foreground mt-1 mb-14 w-full">
              {user.role === "ADMIN" ? (
                <li className="text-foreground hover:bg-muted rounded-lg">
                  <Link
                    href="/admin"
                    onClick={closeDrawer}
                    className="flex w-full items-center gap-3 px-2.5 py-2"
                  >
                    <Lock className="size-4" />
                    <p className="text-sm">Admin</p>
                  </Link>
                </li>
              ) : (
                <li className="text-foreground hover:bg-muted rounded-lg">
                  <Link
                    href="/dashboard"
                    onClick={closeDrawer}
                    className="flex w-full items-center gap-3 px-2.5 py-2"
                  >
                    <Lock className="size-4" />
                    <p className="text-sm">Dashboard</p>
                  </Link>
                </li>
              )}
              <li className="text-foreground hover:bg-muted rounded-lg">
                <Link
                  href={`/${user.username}`}
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                >
                  <LayoutDashboard className="size-4" />
                  <p className="text-sm">Profile</p>
                </Link>
              </li>

              <li className="text-foreground hover:bg-muted rounded-lg">
                <Link
                  href="/dashboard/settings"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                >
                  <Settings className="size-4" />
                  <p className="text-sm">Settings</p>
                </Link>
              </li>

              <li
                className="text-foreground hover:bg-muted rounded-lg"
                onClick={() => {
                  handleClick();
                }}
              >
                <div className="flex w-full items-center gap-3 px-2.5 py-2">
                  <LogOut className="size-4" />
                  <p className="text-sm">Log out </p>
                </div>
              </li>
            </ul>
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{
            name: user.name as string,
            username: user.displayUsername || null,
            image: user.image ?? null,
          }}
          className="size-8 border"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="text-muted-foreground w-[200px] truncate text-sm">
                {user?.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {user.role === "ADMIN" ? (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center space-x-2.5">
              <Lock className="size-4" />
              <p className="text-sm">Admin</p>
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center space-x-2.5">
              <Lock className="size-4" />
              <p className="text-sm">Dashboard</p>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            href={`/${user.username}`}
            className="flex items-center space-x-2.5"
          >
            <LayoutDashboard className="size-4" />
            <p className="text-sm">Profile</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings"
            className="flex items-center space-x-2.5"
          >
            <Settings className="size-4" />
            <p className="text-sm">Settings</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="mr-2 size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 size-4" />
                System default
                {theme === "system" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 size-4" />
                Light
                {theme === "light" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 size-4" />
                Dark
                {theme === "dark" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            handleClick();
          }}
        >
          <div className="flex items-center space-x-2.5">
            <LogOut className="size-4" />
            <p className="text-sm">Log out </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
