import { redirect } from "next/navigation";

import { menubar } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";
import MenuBar from "@/components/feed/MenuBar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { NavBarServer } from "@/components/layout/navbar-server";
import { SiteFooter } from "@/components/layout/site-footer";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
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
      <NavBarServer scroll />
      <div className="relative mx-auto flex w-full max-w-7xl grow gap-5 p-5 max-md:gap-2 max-md:p-2">
        <DashboardSidebar links={filteredLinks} />
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
