import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardLoading() {
  return (
    <section className="flex flex-col items-center justify-center">
      <DashboardHeader heading="Dashboard" text="Current Role :" />
      <Skeleton className="size-full rounded-lg" />
    </section>
  );
}
