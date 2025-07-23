import { NavBarServer } from "@/components/layout/navbar-server";
import { SiteFooter } from "@/components/layout/site-footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBarServer scroll={true} />
      <div className="relative mx-auto flex w-full max-w-5xl grow gap-5 p-5 max-md:gap-2 max-md:p-2">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
