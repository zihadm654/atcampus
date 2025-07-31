
import { menubar } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import TrendsSidebar from "@/components/feed/TrendsSidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
// import { NavMobile } from "@/components/layout/mobile-nav";
import { NavBarServer } from "@/components/layout/navbar-server";
import { SiteFooter } from "@/components/layout/site-footer";
import { redirect } from "next/navigation";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  const filteredLinks = menubar.map((section) => ({
    ...section,
    items: section.items.filter(
      ({ authorizeOnly }) => !authorizeOnly || authorizeOnly === user.role,
    ),
  }));
  return (
    <div className="flex min-h-screen flex-col">
      <NavBarServer scroll={true} />
      <div className="relative mx-auto flex w-full max-w-7xl grow gap-7 p-5 max-md:gap-2 max-md:p-2">
        <DashboardSidebar links={filteredLinks} />
        {children}
        <TrendsSidebar />
      </div>
      <SiteFooter />
    </div>
  );
}
