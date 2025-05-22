"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Menu, X } from "lucide-react";

// import { docsConfig } from "@/config/docs";
import { marketingConfig } from "@/config/marketing";
import { siteConfig } from "@/config/site";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

import { ModeToggle } from "./mode-toggle";

export function NavMobile() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  // const selectedLayout = useSelectedLayoutSegment();
  // const documentation = selectedLayout === "docs";

  const configMap = {
    // docs: docsConfig.mainNav,
  };

  const links = marketingConfig.mainNav;

  // prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "hover:bg-muted active:bg-muted fixed top-2.5 right-2 z-50 rounded-full p-2 transition-colors duration-200 focus:outline-hidden md:hidden",
          open && "hover:bg-muted active:bg-muted",
        )}
      >
        {open ? (
          <X className="text-muted-foreground size-5" />
        ) : (
          <Menu className="text-muted-foreground size-5" />
        )}
      </button>

      <nav
        className={cn(
          "bg-background fixed inset-0 z-20 hidden w-full overflow-auto px-5 py-16 lg:hidden",
          open && "block",
        )}
      >
        <ul className="divide-muted grid divide-y">
          {links &&
            links.length > 0 &&
            links.map(({ title, href }: any) => (
              <li key={href} className="py-3">
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex w-full font-medium capitalize"
                >
                  {title}
                </Link>
              </li>
            ))}

          {session ? (
            <>
              {session?.user.role === "INSTITUTION" ? (
                <li className="py-3">
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex w-full font-medium capitalize"
                  >
                    Admin
                  </Link>
                </li>
              ) : null}

              <li className="py-3">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex w-full font-medium capitalize"
                >
                  Dashboard
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="py-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex w-full font-medium capitalize"
                >
                  Login
                </Link>
              </li>

              <li className="py-3">
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex w-full font-medium capitalize"
                >
                  Sign up
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="mt-5 flex items-center justify-end space-x-4">
          <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
            <Icons.gitHub className="size-6" />
            <span className="sr-only">GitHub</span>
          </Link>
          <ModeToggle />
        </div>
      </nav>
    </>
  );
}
