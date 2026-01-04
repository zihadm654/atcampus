import Link from "next/link";
import type * as React from "react";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { footerLinks, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import { NewsletterForm } from "../forms/newsletter-form";
import { Icons } from "../shared/icons";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t container", className)}>
      <div className="grid grid-cols-2 gap-6 py-14 md:grid-cols-4">
        {footerLinks.map((section) => (
          <div key={section.title}>
            <span className="font-medium text-foreground text-sm">
              {section.title}
            </span>
            <ul className="mt-4 list-inside space-y-3">
              {section.items?.map((link: any) => (
                <li key={link.title}>
                  <Link
                    className="text-muted-foreground text-sm hover:text-primary"
                    href={link.href}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="col-span-full flex flex-col items-end sm:col-span-1 md:col-span-2">
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t py-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            Copyright &copy; 2025. All rights reserved.
          </span>

          <div className="flex items-center gap-3">
            <Link
              className="font-medium underline underline-offset-4"
              href={siteConfig.links.github}
              rel="noreferrer"
              target="_blank"
            >
              <Icons.gitHub className="size-5" />
            </Link>
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
