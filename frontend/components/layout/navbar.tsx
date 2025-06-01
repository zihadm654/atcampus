"use client";

import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

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

import SearchField from "../feed/SearchField";
import { ModeToggle } from "./mode-toggle";
import { UserAccountNav } from "./user-account-nav";

interface NavBarProps {
  scroll?: boolean;
  large?: boolean;
}

export function NavBar({ scroll = false }: NavBarProps) {
  const scrolled = useScroll(50);
  const { data: session, isPending } = useSession();
  // const { setShowSignInModal } = useContext(ModalContext);

  const selectedLayout = useSelectedLayoutSegment();

  const configMap = {
    // docs: docsConfig.mainNav,
  };

  const links = marketingConfig.mainNav;

  return (
    <header
      className={`bg-background/60 sticky top-0 z-40 flex w-full justify-center backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-transparent") : "border-b"
      }`}
    >
      <MaxWidthWrapper
        className="flex h-14 items-center justify-between py-4"
        // large={documentation}
      >
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="text-primary flex items-center space-x-1.5">
            <Image
              src="/_static/logo1.png"
              alt="logo"
              height={30}
              width={30}
              className=""
            />
            <span className="font-urban hidden text-xl font-bold md:block">
              {siteConfig.name}
            </span>
          </Link>
          <SearchField />
        </div>

        <div className="flex items-center space-x-3">
          <ModeToggle />
          {/* right header for docs */}
          {session?.user ? (
            <>
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
