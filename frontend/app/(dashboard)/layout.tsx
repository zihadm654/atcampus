import { validateAdminAccess } from "@/lib/auth/server-validation";
import { NavBarServer } from "@/components/layout/navbar-server";
import { SiteFooter } from "@/components/layout/site-footer";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  // Server-side admin validation - more secure and performant
  const { user } = await validateAdminAccess("/unauthorized");

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
