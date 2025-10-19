"use client";

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
import Link from "next/link";
import { redirect } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { UserAvatar } from "@/components/shared/user-avatar";
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
import { useMediaQuery } from "@/hooks/use-media-query";
import { signOut, useSession } from "@/lib/auth-client";

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
      <div className="size-8 animate-pulse rounded-full border bg-muted" />
    );

  if (isMobile) {
    return (
      <Drawer.Root onClose={closeDrawer} open={open}>
        <Drawer.Trigger onClick={() => setOpen(true)}>
          <UserAvatar
            className="size-9 border"
            user={{
              name: user.name as string,
              username: user.username || null,
              image: user.image || null,
            }}
          />
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 z-40 h-full bg-background/80 backdrop-blur-xs"
            onClick={closeDrawer}
          />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-[10px] border bg-background px-3 text-sm">
            <div className="sticky top-0 z-20 flex w-full items-center justify-center bg-inherit">
              <div className="my-3 h-1.5 w-16 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col">
                {user.name && <p className="font-medium">{user.name}</p>}
                {user.email && (
                  <p className="w-[200px] truncate text-muted-foreground">
                    {user?.email}
                  </p>
                )}
              </div>
            </div>

            <ul className="mt-1 mb-14 w-full text-muted-foreground">
              {user.role === "ADMIN" ? (
                <li className="rounded-lg text-foreground hover:bg-muted">
                  <Link
                    className="flex w-full items-center gap-3 px-2.5 py-2"
                    href="/admin"
                    onClick={closeDrawer}
                  >
                    <Lock className="size-4" />
                    <p className="text-sm">Admin</p>
                  </Link>
                </li>
              ) : (
                <li className="rounded-lg text-foreground hover:bg-muted">
                  <Link
                    className="flex w-full items-center gap-3 px-2.5 py-2"
                    href="/dashboard"
                    onClick={closeDrawer}
                  >
                    <Lock className="size-4" />
                    <p className="text-sm">Dashboard</p>
                  </Link>
                </li>
              )}
              <li className="rounded-lg text-foreground hover:bg-muted">
                <Link
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                  href={`/${user.username}`}
                  onClick={closeDrawer}
                >
                  <LayoutDashboard className="size-4" />
                  <p className="text-sm">Profile</p>
                </Link>
              </li>

              <li className="rounded-lg text-foreground hover:bg-muted">
                <Link
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                  href="/dashboard/settings"
                  onClick={closeDrawer}
                >
                  <Settings className="size-4" />
                  <p className="text-sm">Settings</p>
                </Link>
              </li>

              <li
                className="rounded-lg text-foreground hover:bg-muted"
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
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger>
        <UserAvatar
          className="size-8 border"
          user={{
            name: user.name as string,
            username: user.displayUsername || null,
            image: user.image ?? null,
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-muted-foreground text-sm">
                {user?.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {user.role === "ADMIN" ? (
          <DropdownMenuItem asChild>
            <Link className="flex items-center space-x-2.5" href="/admin">
              <Lock className="size-4" />
              <p className="text-sm">Admin</p>
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link className="flex items-center space-x-2.5" href="/dashboard">
              <Lock className="size-4" />
              <p className="text-sm">Dashboard</p>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            className="flex items-center space-x-2.5"
            href={`/${user.username}`}
          >
            <LayoutDashboard className="size-4" />
            <p className="text-sm">Profile</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            className="flex items-center space-x-2.5"
            href="/dashboard/settings"
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
