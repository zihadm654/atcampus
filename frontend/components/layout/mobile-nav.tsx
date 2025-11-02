"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icons } from "@/components/shared/icons";
// import { docsConfig } from "@/config/docs";
import { marketingConfig } from "@/config/marketing";
import { siteConfig } from "@/config/site";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { ModeToggle } from "./mode-toggle";

export function NavMobile() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  // const selectedLayout = useSelectedLayoutSegment();
  // const documentation = selectedLayout === "docs";

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
        className={cn(
          "fixed top-2.5 right-2 z-50 rounded-full p-2 transition-colors duration-200 hover:bg-muted focus:outline-hidden active:bg-muted md:hidden",
          open && "hover:bg-muted active:bg-muted"
        )}
        onClick={() => setOpen(!open)}
        type="button"
      >
        {open ? (
          <X className="size-5 text-muted-foreground" />
        ) : (
          <Menu className="size-5 text-muted-foreground" />
        )}
      </button>

      <nav
        className={cn(
          "fixed inset-0 z-20 hidden w-full overflow-auto bg-background px-5 py-16 lg:hidden",
          open && "block"
        )}
      >
        <ul className="grid divide-y divide-muted">
          {links &&
            links.length > 0 &&
            links.map(({ title, href }: any) => (
              <li className="py-3" key={href}>
                <Link
                  className="flex w-full font-medium capitalize"
                  href={href}
                  onClick={() => setOpen(false)}
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
                    className="flex w-full font-medium capitalize"
                    href="/admin"
                    onClick={() => setOpen(false)}
                  >
                    Admin
                  </Link>
                </li>
              ) : null}

              <li className="py-3">
                <Link
                  className="flex w-full font-medium capitalize"
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="py-3">
                <Link
                  className="flex w-full font-medium capitalize"
                  href="/login"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
              </li>

              <li className="py-3">
                <Link
                  className="flex w-full font-medium capitalize"
                  href="/register"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="mt-5 flex items-center justify-end space-x-4">
          <Link href={siteConfig.links.github} rel="noreferrer" target="_blank">
            <Icons.gitHub className="size-6" />
            <span className="sr-only">GitHub</span>
          </Link>
          <ModeToggle />
        </div>
      </nav>
    </>
  );
}
