import { UserRole } from "@prisma/client";
import type { SidebarNavItem } from "@/types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "Your Activity",
    items: [
      {
        href: "/admin",
        icon: "laptop",
        title: "Admin Panel",
        authorizeOnly: UserRole.ADMIN,
      },
      { href: "/", icon: "home", title: "Feed" },
      {
        href: "/courses/my-courses",
        icon: "bookOpen",
        title: "Courses",
        // authorizeOnly: UserRole.STUDENT,
      },
      {
        href: "/jobs",
        icon: "job",
        title: "Jobs",
        // authorizeOnly: UserRole.STUDENT,
      },
    ],
  },
  {
    title: "Saved",
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
    title: "Your Activity",
    items: [
      {
        href: "/connections",
        icon: "users",
        title: "Connections",
      },
      {
        href: "/courses/my-courses",
        icon: "bookOpen",
        title: "Courses",
      },
      {
        href: "/jobs/myJobs",
        icon: "job",
        title: "Jobs",
      },
      {
        href: "/researches/myResearches",
        icon: "research",
        title: "Researches",
      },
    ],
  },
  {
    title: "Saved",
    items: [
      { href: "/bookmarks", icon: "bookmark", title: "Saved Post" },
      { href: "/savedJobs", icon: "bookMarked", title: "Saved Job" },
      { href: "/savedResearches", icon: "research", title: "Saved Research" },
    ],
  },
];
