import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { NavBarServer } from "@/components/layout/navbar-server";
import { SiteFooter } from "@/components/layout/site-footer";
import { menubar } from "@/config/dashboard";
import { getCurrentUser } from "@/lib/session";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    // Redirect to login, preserving the current path as the destination
    // const loginUrl = new URL("/login", process.env.NEXT_PUBLIC_APP_URL);
    // In server components, we can't access the current path directly
    // The middleware should handle this redirect with the 'from' parameter
    redirect("/login");
  }

  // Server-side role and status validation
  // This is more reliable and performant than API calls
  if (
    (user.role === "ORGANIZATION" || user.role === "INSTITUTION") &&
    user.status !== "ACTIVE"
  ) {
    if (user.status === "PENDING") {
      redirect("/pending-approval");
    } else if (user.status === "REJECTED") {
      redirect("/rejected-account");
    }
  }

  // Filter navigation based on user role
  const filteredLinks = menubar.map((section) => ({
    ...section,
    items: section.items.filter(
      ({ authorizeOnly }) => !authorizeOnly || authorizeOnly === user?.role
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
