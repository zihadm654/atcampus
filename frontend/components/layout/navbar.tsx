"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { marketingConfig } from "@/config/marketing";
import { useScroll } from "@/hooks/use-scroll";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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
  const { data: session,isPending,error } = useSession();

  const links = marketingConfig.mainNav;
  const path = usePathname();

  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center bg-background/60 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-transparent") : "border-b"
      }`}
    >
      <MaxWidthWrapper
        className="grid grid-cols-2 gap-4 space-x-4 pt-2 max-md:gap-2 md:grid-cols-4"
        // large={documentation}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <Link className="flex items-center space-x-2 text-primary" href="/">
            <Image
              alt="logo"
              className=""
              height={50}
              priority
              src="/_static/logo1.png"
              width={50}
            />
          </Link>
          <SearchField />
        </div>
        {links && links.length > 0 ? (
          <nav className="col-span-2 flex items-center justify-center gap-2 space-x-6 max-md:order-3 max-md:justify-around">
            {links?.map((item) => {
              const Icon = Icons[item.icon || "arrowRight"];
              return (
                <Fragment key={`link-fragment-${item.title}`}>
                  <Link
                    className={cn(
                      "flex items-center gap-3 rounded-md p-2 font-medium text-sm hover:bg-muted",
                      path === item.href
                        ? "border border-b-blue-700 bg-muted text-blue-700"
                        : "text-muted-foreground hover:text-accent-foreground",
                      item.disabled &&
                        "cursor-not-allowed opacity-80 hover:bg-transparent hover:text-muted-foreground"
                    )}
                    href={item.disabled ? "#" : item.href}
                    key={`link-${item.title}`}
                    prefetch={true}
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
          ) : isPending ? (
            <Skeleton className="hidden h-9 w-28 rounded-full lg:flex" />
          ) : (
            <>
              <Button
                className="hidden gap-2 px-5 md:flex"
                rounded="full"
                size="sm"
                variant="default"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                className="hidden gap-2 px-5 md:flex"
                rounded="full"
                size="sm"
                variant="default"
              >
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </MaxWidthWrapper>
    </header>
  );
}
