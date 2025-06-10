"use client";

import { Fragment, Suspense, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { marketingConfig } from "@/config/marketing";
import { siteConfig } from "@/config/site";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ModalContext } from "@/components/modals/providers";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

import MessagesButton from "../feed/MessagesButton";
import NotificationsButton from "../feed/NotificationsButton";
import SearchField from "../feed/SearchField";
import { UserAccountNav } from "./user-account-nav";

// import { Skeleton } from "../ui/skeleton";

interface NavBarProps {
  scroll?: boolean;
  large?: boolean;
}

export function NavBar({ scroll = false }: NavBarProps) {
  const scrolled = useScroll(75);
  const { data: session } = useSession();
  // const { setShowSignInModal } = useContext(ModalContext);

  // const selectedLayout = useSelectedLayoutSegment();

  // const configMap = {
  //   // docs: docsConfig.mainNav,
  // };

  const links = marketingConfig.mainNav;
  const path = usePathname();

  return (
    <header
      className={`bg-background/60 sticky top-0 z-40 flex w-full justify-center backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-transparent") : "border-b"
      }`}
    >
      <MaxWidthWrapper
        className="grid h-14 grid-cols-3 gap-4 py-4 max-md:grid-cols-2"
        // large={documentation}
      >
        <div className="flex gap-3 md:gap-6">
          <Link href="/" className="text-primary flex items-center space-x-1.5">
            <Image
              src="/_static/logo1.png"
              alt="logo"
              height={30}
              width={30}
              className=""
            />
          </Link>
          <SearchField />
        </div>
        {links && links.length > 0 ? (
          <nav className="hidden items-center gap-6 md:flex">
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
                    {/* {item.title} */}
                  </Link>
                </Fragment>
              );
            })}
          </nav>
        ) : null}
        <div className="flex items-center justify-end space-x-3">
          {/* right header for docs */}{" "}
          {session?.user ? (
            <>
              <NotificationsButton initialState={{ unreadCount: 0 }} />
              <MessagesButton initialState={{ unreadCount: 0 }} />
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
