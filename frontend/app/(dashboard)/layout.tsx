import { redirect } from "next/navigation";

import { menubar } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { NavBarServer } from "@/components/layout/navbar-server";
import { SiteFooter } from "@/components/layout/site-footer";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  if (user.role === "ORGANIZATION" || user.role === "INSTITUTION") {
    if (user.status === "PENDING") {
      redirect("/pending-approval");
    } else if (user.status === "REJECTED") {
      redirect("/rejected-account");
    }
  }
  if (user.role !== "ADMIN") redirect("/dashboard");
  return (
    <div className="flex min-h-screen flex-col">
      <NavBarServer scroll />
      <div className="relative mx-auto flex w-full max-w-7xl grow gap-5 p-5 max-md:gap-2 max-md:p-2">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
