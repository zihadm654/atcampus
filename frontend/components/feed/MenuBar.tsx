import { Fragment } from "react";
import Link from "next/link";
import { SidebarNavItem } from "@/types";
import { Bookmark, Briefcase, GraduationCap, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Icons } from "../shared/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface MenuBarProps {
  className?: string;
  links: SidebarNavItem[];
}

export default async function MenuBar({ className, links }: MenuBarProps) {
  return (
    <div className={className}>
      <nav className="flex flex-1 flex-col gap-8 px-4 pt-4">
        {links?.map((section) => (
          <section key={section.title} className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const Icon = Icons[item.icon || "arrowRight"];
              return (
                item.href && (
                  <Fragment key={`link-fragment-${item.title}`}>
                    <Link
                      key={`link-${item.title}`}
                      href={item.disabled ? "#" : item.href}
                      className={cn(
                        "hover:bg-muted flex items-center gap-3 rounded-md p-2 text-sm font-medium",
                        // path === item.href
                        //   ? "bg-muted"
                        //   : "text-muted-foreground hover:text-accent-foreground",
                        item.disabled &&
                          "hover:text-muted-foreground cursor-not-allowed opacity-80 hover:bg-transparent",
                      )}
                    >
                      <Icon className="size-5" />
                      {item.title}
                    </Link>
                    {/* <Tooltip key={`tooltip-${item.title}`}>
                        <TooltipTrigger asChild>
                          <Link
                            key={`link-tooltip-${item.title}`}
                            href={item.disabled ? "#" : item.href}
                            className={cn(
                              "hover:bg-muted flex items-center gap-3 rounded-md py-2 text-sm font-medium",
                              // path === item.href
                              //   ? "bg-muted"
                              //   : "text-muted-foreground hover:text-accent-foreground",
                              item.disabled &&
                                "hover:text-muted-foreground cursor-not-allowed opacity-80 hover:bg-transparent",
                            )}
                          >
                            <span className="flex size-full items-center justify-center">
                              <Icon className="size-5" />
                            </span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip> */}
                  </Fragment>
                )
              );
            })}
          </section>
        ))}
      </nav>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Connections"
        asChild
      >
        <Link href="/connections">
          <GraduationCap />
          <span className="hidden lg:inline">Connections</span>
        </Link>
      </Button>
      {/* <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Courses"
        asChild
      >
        <Link href="/courses">
          <GraduationCap />
          <span className="hidden lg:inline">Courses</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Jobs"
        asChild
      >
        <Link href="/jobs">
          <Briefcase />
          <span className="hidden lg:inline">Jobs</span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Bookmarks"
        asChild
      >
        <Link href="/bookmarks">
          <Bookmark />
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button> */}
    </div>
  );
}
