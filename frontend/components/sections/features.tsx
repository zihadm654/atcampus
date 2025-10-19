import Link from "next/link";
import { HeaderSection } from "@/components/shared/header-section";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { features } from "@/config/landing";

export default function Features() {
  return (
    <section>
      <div className="pt-28 pb-6">
        <MaxWidthWrapper>
          <HeaderSection
            label="Features"
            subtitle="Harum quae dolore inventore repudiandae? orrupti aut temporibus
          ariatur."
            title="Discover all features."
          />

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = Icons[feature.icon || "nextjs"];
              return (
                <div
                  className="group relative overflow-hidden rounded-2xl border bg-background p-5 md:p-8"
                  key={feature.title}
                >
                  <div
                    aria-hidden="true"
                    className="-translate-y-1/2 group-hover:-translate-y-1/4 absolute inset-0 aspect-video rounded-full border bg-linear-to-b from-purple-500/80 to-white opacity-25 blur-2xl duration-300 dark:from-white dark:to-white dark:opacity-5 dark:group-hover:opacity-10"
                  />
                  <div className="relative">
                    <div className="relative flex size-12 rounded-2xl border border-border shadow-xs *:relative *:m-auto *:size-6">
                      <Icon />
                    </div>

                    <p className="mt-6 pb-6 text-muted-foreground">
                      {feature.description}
                    </p>

                    <div className="-mb-5 md:-mb-7 flex gap-3 border-muted border-t py-4">
                      <Button
                        className="px-4"
                        rounded="xl"
                        size="sm"
                        variant="secondary"
                      >
                        <Link className="flex items-center gap-2" href="/">
                          <span>Visit the site</span>
                          <Icons.arrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </MaxWidthWrapper>
      </div>
    </section>
  );
}
