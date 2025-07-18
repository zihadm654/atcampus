import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";

import { getCurrentUser } from "@/lib/session";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const user = await getCurrentUser();

  if (user) {
    if (user.status === "PENDING") {
      throw new APIError("UNAUTHORIZED", {
        message: "Your account is pending approval.",
        redirect: "/pending-approval",
      });
    }
    if (user.status === "REJECTED") {
      throw new APIError("UNAUTHORIZED", {
        message: "Your account has been rejected.",
        redirect: "/rejected-account",
      });
    }
    if (user.role === "ADMIN") redirect("/admin");
    redirect("/");
  }

  return <div className="min-h-screen">{children}</div>;
}
