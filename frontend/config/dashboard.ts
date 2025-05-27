import { SidebarNavItem } from "@/types";
import { UserRole } from "@prisma/client";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      {
        href: "/admin",
        icon: "laptop",
        title: "Admin Panel",
        authorizeOnly: UserRole.INSTITUTION,
      },
      { href: "/dashboard", icon: "dashboard", title: "Dashboard" },
      { href: "/dashboard/charts", icon: "lineChart", title: "Charts" },
      {
        href: "/admin/orders",
        icon: "package",
        title: "Orders",
        badge: 2,
        authorizeOnly: UserRole.INSTITUTION,
      },
      {
        href: "#/dashboard/posts",
        icon: "post",
        title: "User Posts",
        authorizeOnly: UserRole.INSTITUTION,
        disabled: true,
      },
    ],
  },
  {
    title: "OPTIONS",
    items: [
      { href: "/dashboard/settings", icon: "settings", title: "Settings" },
      { href: "/", icon: "home", title: "Homepage" },
      {
        href: "#",
        icon: "messages",
        title: "Support",
        // authorizeOnly: UserRole.USER,
        disabled: true,
      },
    ],
  },
];
