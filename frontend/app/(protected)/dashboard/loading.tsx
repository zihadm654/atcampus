import { DashboardHeader } from "@/components/dashboard/header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <section className="flex flex-col items-center justify-center">
      <DashboardHeader heading="Dashboard" text="Current Role :" />
      <Skeleton className="size-full rounded-lg" />
    </section>
  );
}
