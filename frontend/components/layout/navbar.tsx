"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { marketingConfig } from "@/config/marketing";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

import MessagesButton from "../feed/MessagesButton";
import NotificationsButton from "../feed/NotificationsButton";
import SearchField from "../feed/SearchField";
import { UserAccountNav } from "./user-account-nav";

interface NavBarProps {
  scroll?: boolean;
  large?: boolean;
  initialNotificationCount: number;
  initialMessageCount: number;
}

export function NavBar({
  scroll = false,
  initialNotificationCount,
  initialMessageCount,
}: NavBarProps) {
  const scrolled = useScroll(75);
  const { data: session } = useSession();

  const links = marketingConfig.mainNav;
  const path = usePathname();

  return (
    <header
      className={`bg-background/60 sticky top-0 z-40 flex w-full justify-center backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-transparent") : "border-b"
      }`}
    >
      <MaxWidthWrapper
        className="grid grid-cols-3 gap-4 space-x-4 gap-y-0 pt-2 max-md:grid-cols-2 max-md:gap-2"
        // large={documentation}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="text-primary flex items-center space-x-2">
            <Image
              src="/_static/logo1.png"
              alt="logo"
              height={50}
              width={50}
              priority
              className=""
            />
          </Link>
          <SearchField />
        </div>
        {links && links.length > 0 ? (
          <nav className="flex items-center justify-start gap-2 space-x-6 max-md:order-3 max-md:col-span-2 max-md:justify-around">
            {links?.map((item) => {
              const Icon = Icons[item.icon || "arrowRight"];
              return (
                <Fragment key={`link-fragment-${item.title}`}>
                  <Link
                    key={`link-${item.title}`}
                    href={item.disabled ? "#" : item.href}
                    prefetch={true}
                    className={cn(
                      "hover:bg-muted flex items-center gap-3 rounded-md p-2 text-sm font-medium",
                      path === item.href
                        ? "bg-muted border border-b-blue-700 text-blue-700"
                        : "text-muted-foreground hover:text-accent-foreground",
                      item.disabled &&
                        "hover:text-muted-foreground cursor-not-allowed opacity-80 hover:bg-transparent",
                    )}
                  >
                    <Icon className="size-6.5" />
                    <span className="hidden lg:block">{item.title}</span>
                  </Link>
                </Fragment>
              );
            })}
          </nav>
        ) : null}
        <div className="flex items-center justify-end space-x-2">
          {/* right header for docs */}{" "}
          {session?.user ? (
            <>
              <NotificationsButton
                initialState={{ unreadCount: initialNotificationCount }}
              />
              <MessagesButton
                initialState={{ unreadCount: initialMessageCount }}
              />
              <UserAccountNav />
            </>
          ) : !session ? (
            <>
              <Button
                className="hidden gap-2 px-5 md:flex"
                variant="default"
                size="sm"
                rounded="full"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                className="hidden gap-2 px-5 md:flex"
                variant="default"
                size="sm"
                rounded="full"
              >
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          ) : (
            <Skeleton className="hidden h-9 w-28 rounded-full lg:flex" />
          )}
        </div>
      </MaxWidthWrapper>
    </header>
  );
}
