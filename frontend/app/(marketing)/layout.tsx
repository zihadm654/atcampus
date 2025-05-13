import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { NavMobile } from "@/components/layout/mobile-nav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import Sidebar from "@/components/layout/left-sidebar";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavMobile />
      <NavBar scroll={true} />
      <main className="flex-1">
      <MaxWidthWrapper>
        <div className="grid grid-xols-1 lg:grid-cols-12 gap-6">
        <div className="hidden lg:block lg:col-span-3 ">
                      {" "}
          <Sidebar />
            </div>
            <div className="lg:col-span-9">{children}</div>
            </div>
      </MaxWidthWrapper>
        </main>
      <SiteFooter />
    </div>
  );
}
