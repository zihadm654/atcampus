import { NavBarServer } from "@/components/layout/navbar-server";
import { SiteFooter } from "@/components/layout/site-footer";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBarServer scroll />
      <div className="relative mx-auto flex w-full container grow gap-5 p-5 max-md:gap-2 max-md:p-2">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
