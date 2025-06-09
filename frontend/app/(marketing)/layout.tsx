import { redirect } from "next/navigation";

import { menubar } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
// import { NavMobile } from "@/components/layout/mobile-nav";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";

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
      <NavBar scroll={true} />
      <div className="relative mx-auto flex w-full max-w-7xl grow gap-5 p-5">
        <DashboardSidebar links={filteredLinks} />
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
