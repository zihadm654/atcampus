"use client";

import { BookOpen, Building2, Users2 } from "lucide-react";
import { useState } from "react";
import { Icons } from "@/components/shared/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateProfilePermissions } from "@/lib/permissions";
import { UserRole } from "@/lib/validations/auth";
import type { TabConfig } from "@/types/profile-types";
import type { UserData } from "@/types/types";
import { ClubsTab } from "./tabs/ClubsTab";
import CoursesTab from "./tabs/CoursesTab";
import { EventsTab } from "./tabs/EventsTab";
import JobsTab from "./tabs/JobsTab";
import MembersTab from "./tabs/MembersTab";
// Import tab content components
import OverviewTab from "./tabs/OverviewTab";
import PostsTab from "./tabs/PostsTab";
import ResearchTab from "./tabs/ResearchTab";
import SchoolsTab from "./tabs/SchoolsTab";

// Enhanced role-based tab configuration with permissions
const TAB_CONFIGURATIONS: Record<UserRole, TabConfig[]> = {
  STUDENT: [
    {
      value: "overview",
      label: "Overview",
      icon: Icons.home,
      roles: [UserRole.STUDENT],
    },
    {
      value: "posts",
      label: "Posts",
      icon: Icons.post,
      roles: [UserRole.STUDENT],
    },
    {
      value: "courses",
      label: "Courses",
      icon: BookOpen,
      roles: [UserRole.STUDENT],
    },
    {
      value: "jobs",
      label: "Jobs & Activities",
      icon: Icons.job,
      roles: [UserRole.STUDENT],
    },
    {
      value: "research",
      label: "Research",
      icon: Icons.bookMarked,
      roles: [UserRole.STUDENT],
    },
  ],
  PROFESSOR: [
    {
      value: "overview",
      label: "Overview",
      icon: Icons.home,
      roles: [UserRole.PROFESSOR],
    },
    {
      value: "posts",
      label: "Posts",
      icon: Icons.post,
      roles: [UserRole.PROFESSOR],
    },
    {
      value: "courses",
      label: "Courses",
      icon: BookOpen,
      roles: [UserRole.PROFESSOR],
    },
    {
      value: "research",
      label: "Research",
      icon: Icons.bookMarked,
      roles: [UserRole.PROFESSOR],
    },
  ],
  INSTITUTION: [
    {
      value: "overview",
      label: "Overview",
      icon: Icons.home,
      roles: [UserRole.INSTITUTION],
    },
    {
      value: "posts",
      label: "Posts",
      icon: Icons.post,
      roles: [UserRole.INSTITUTION],
    },
    {
      value: "courses",
      label: "Courses",
      icon: BookOpen,
      roles: [UserRole.INSTITUTION],
    },
    {
      value: "schools",
      label: "Schools",
      icon: Building2,
      roles: [UserRole.INSTITUTION],
    },
    // {
    //   value: "clubs",
    //   label: "Clubs",
    //   icon: Icons.chart,
    //   roles: [UserRole.INSTITUTION],
    // },
    // {
    //   value: "events",
    //   label: "Events",
    //   icon: Icons.settings,
    //   roles: [UserRole.INSTITUTION],
    // },
    {
      value: "members",
      label: "Members",
      icon: Users2,
      roles: [UserRole.ORGANIZATION],
    },
  ],
  ORGANIZATION: [
    {
      value: "overview",
      label: "Overview",
      icon: Icons.home,
      roles: [UserRole.ORGANIZATION],
    },
    {
      value: "posts",
      label: "Posts",
      icon: Icons.post,
      roles: [UserRole.ORGANIZATION],
    },
    {
      value: "jobs",
      label: "Jobs",
      icon: Icons.job,
      roles: [UserRole.ORGANIZATION],
    },
    {
      value: "research",
      label: "Research",
      icon: Icons.bookMarked,
      roles: [UserRole.ORGANIZATION],
    },
  ],
  ADMIN: [
    {
      value: "overview",
      label: "Overview",
      icon: Icons.home,
      roles: [UserRole.ADMIN],
    },
    {
      value: "posts",
      label: "Posts",
      icon: Icons.post,
      roles: [UserRole.ADMIN],
    },
    {
      value: "courses",
      label: "Courses",
      icon: BookOpen,
      roles: [UserRole.ADMIN],
    },
    {
      value: "schools",
      label: "Schools",
      icon: Building2,
      roles: [UserRole.ADMIN],
    },
    {
      value: "members",
      label: "Members",
      icon: Users2,
      roles: [UserRole.ADMIN],
    },
    {
      value: "jobs",
      label: "Jobs",
      icon: Icons.job,
      roles: [UserRole.ADMIN],
    },
    {
      value: "settings",
      label: "Settings",
      icon: Icons.settings,
      roles: [UserRole.ADMIN],
    },
  ],
};

interface ProfileTabsProps {
  user: UserData;
  jobs: any;
  researches: any;
  courses: any;
  loggedInUserId: string;
  loggedInUserRole: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  loading?: {
    jobs?: boolean;
    researches?: boolean;
    courses?: boolean;
  };
}

// Helper function to get role-based tabs without permission filtering for profile viewing
const getProfileTabs = (role: UserRole): TabConfig[] =>
  TAB_CONFIGURATIONS[role] || TAB_CONFIGURATIONS.STUDENT;

export default function ProfileTabs({
  user,
  jobs,
  researches,
  courses,
  loggedInUserId,
  loggedInUserRole,
  activeTab = "overview",
  onTabChange,
  loading,
}: ProfileTabsProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Calculate permissions based on user relationship and roles
  const permissions = calculateProfilePermissions(
    user.id,
    loggedInUserId,
    user.role as UserRole,
    loggedInUserRole as UserRole
  );

  // Get tabs based on the profile owner's role without permission filtering
  const roleTabs = getProfileTabs(user.role as UserRole);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
      <Tabs onValueChange={handleTabChange} value={currentTab}>
        <div className="border-b">
          <TabsList className="flex h-auto w-full justify-start bg-transparent p-0">
            {roleTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  className="flex items-center gap-2 rounded-none border-transparent border-b-2 px-4 py-3 transition-all data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50/50 data-[state=active]:text-blue-600"
                  key={tab.value}
                  value={tab.value}
                >
                  <IconComponent className="size-4" />
                  <span className="hidden md:block">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Contents with proper permission checks and data passing */}
        <TabsContent className="space-y-2 p-3" value="overview">
          <OverviewTab
            courses={courses}
            jobs={jobs}
            loading={loading?.courses || loading?.jobs}
            loggedInUserId={loggedInUserId}
            permissions={permissions}
            researches={researches}
            user={user}
          />
        </TabsContent>

        <TabsContent className="mx-auto max-w-2xl p-6" value="posts">
          <PostsTab permissions={permissions} user={user} />
        </TabsContent>

        <TabsContent className="p-3" value="courses">
          <CoursesTab
            courses={courses}
            isCurrentUser={user.id === loggedInUserId}
            permissions={permissions}
            user={user}
          />
        </TabsContent>

        <TabsContent className="p-4" value="jobs">
          <JobsTab
            jobs={jobs}
            loading={loading?.jobs}
            loggedInUserId={loggedInUserId}
            permissions={permissions}
            userRole={user.role as UserRole}
          />
        </TabsContent>

        <TabsContent className="p-3" value="research">
          <ResearchTab
            loading={loading?.researches}
            loggedInUserId={loggedInUserId}
            permissions={permissions}
            researches={researches}
            user={user}
            userRole={user.role as UserRole} // Pass the user prop
          />
        </TabsContent>

        {/* Institution-specific tabs */}
        <TabsContent className="p-4" value="schools">
          <SchoolsTab
            isCurrentUser={user.id === loggedInUserId}
            permissions={permissions}
            user={user}
          />
        </TabsContent>

        {/* Organization-specific tabs */}
        <TabsContent className="p-3" value="members">
          <MembersTab
            loggedInUserId={loggedInUserId}
            permissions={permissions}
            user={user}
          />
        </TabsContent>

        {/* Additional tabs for institutions */}
        <TabsContent value="clubs">
          <ClubsTab
            isOwnProfile={user.id === loggedInUserId}
            username={user.username || user.id}
            userRole={user.role}
          />
        </TabsContent>

        <TabsContent value="events">
          <EventsTab
            isOwnProfile={user.id === loggedInUserId}
            username={user.username || user.id}
            userRole={user.role}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
