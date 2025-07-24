import { DashboardHeader } from "@/components/dashboard/header";
import { SkeletonSection } from "@/components/shared/section-skeleton";

export default function DashboardSettingsLoading() {
  return (
    <section className="flex flex-col items-center justify-center">
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="divide-y divide-muted pb-10">
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection card />
      </div>
    </section>
  );
}
