import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import MenuBar from "@/components/feed/MenuBar";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar scroll />
      <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
        <MenuBar className="bg-card sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
        {children}
      </div>
      <SiteFooter />
      <MenuBar className="bg-card sticky bottom-0 flex w-full justify-center gap-5 border-t p-3 sm:hidden" />
    </div>
  );
}
