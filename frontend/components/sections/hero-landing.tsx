import Link from "next/link";
import { Icons } from "@/components/shared/icons";
import { buttonVariants } from "@/components/ui/button";
// import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export default async function HeroLanding() {
  return (
    <section className="space-y-6 py-12 sm:py-20 lg:py-20">
      <div className="container flex max-w-5xl flex-col items-center gap-5 text-center">
        <Link
          className={cn(
            buttonVariants({ variant: "outline", size: "sm", rounded: "full" }),
            "px-4"
          )}
          href="https://twitter.com/miickasmt/status/1810465801649938857"
          target="_blank"
        >
          <span className="mr-3">🎉</span>
          <span className="hidden md:flex">Introducing&nbsp;</span> Next Auth
          Roles Template on <Icons.twitter className="ml-2 size-3.5" />
        </Link>

        <h1 className="text-balance font-extrabold font-urban text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-[66px]">
          Kick off with a bang with{" "}
          <span className="font-extrabold text-gradient_indigo-purple">
            SaaS Starter
          </span>
        </h1>

        <p
          className="max-w-2xl text-balance text-muted-foreground leading-normal sm:text-xl sm:leading-8"
          style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
        >
          Build your next project using Next.js 14, Prisma, Neon, Auth.js v5,
          Resend, React Email, Shadcn/ui, Stripe.
        </p>

        <div
          className="flex justify-center space-x-2 md:space-x-4"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <Link
            className={cn(
              buttonVariants({ size: "lg", rounded: "full" }),
              "gap-2"
            )}
            href="/pricing"
            prefetch={true}
          >
            <span>Go Pricing</span>
            <Icons.arrowRight className="size-4" />
          </Link>
          <Link
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                rounded: "full",
              }),
              "px-5"
            )}
            href={siteConfig.links.github}
            rel="noreferrer"
            target="_blank"
          >
            <Icons.gitHub className="mr-2 size-4" />
            <p>
              <span className="hidden sm:inline-block">Star on</span> GitHub{" "}
              <span className="font-semibold" />
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
