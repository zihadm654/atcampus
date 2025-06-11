import { SidebarNavItem } from "@/types";
import { UserRole } from "@prisma/client";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      {
        href: "/admin/dashboard",
        icon: "laptop",
        title: "Admin Panel",
        authorizeOnly: UserRole.INSTITUTION,
      },
      { href: "/", icon: "home", title: "Feed" },
      // { href: "/dashboard/charts", icon: "lineChart", title: "Charts" },
      {
        href: "/admin/orders",
        icon: "package",
        title: "Orders",
        badge: 2,
        authorizeOnly: UserRole.INSTITUTION,
      },
      {
        href: "/courses",
        icon: "bookOpen",
        title: "Courses",
        authorizeOnly: UserRole.STUDENT,
      },
      {
        href: "/jobs",
        icon: "billing",
        title: "Jobs",
        authorizeOnly: UserRole.STUDENT,
      },
    ],
  },
  {
    title: "OTHERS",
    items: [
      { href: "/bookmarks", icon: "package", title: "Settings" },
      { href: "/saveJob", icon: "billing", title: "Saved Jobs" },
      // {
      //   href: "#",
      //   icon: "messages",
      //   title: "Support",
      //   // authorizeOnly: UserRole.USER,
      //   disabled: true,
      // },
    ],
  },
];
export const menubar: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      {
        href: "/connections",
        icon: "users",
        title: "Connections",
      },
      // { href: "/", icon: "home", title: "Feed" },
      {
        href: "/courses",
        icon: "bookOpen",
        title: "Courses",
      },
      {
        href: "/jobs",
        icon: "job",
        title: "Jobs",
      },
      {
        href: "/researches",
        icon: "research",
        title: "Researches",
      },
    ],
  },
  {
    title: "OTHERS",
    items: [
      { href: "/bookmarks", icon: "bookmark", title: "Saved Post" },
      { href: "/savedJobs", icon: "bookMarked", title: "Saved Job" },
      { href: "/savedResearchs", icon: "research", title: "Saved Research" },
      // {
      //   href: "#",
      //   icon: "messages",
      //   title: "Support",
      // authorizeOnly: UserRole.USER,
      //   disabled: true,
      // },
    ],
  },
];
