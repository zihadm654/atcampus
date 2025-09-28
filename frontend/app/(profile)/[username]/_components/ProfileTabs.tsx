"use client";

import { useState } from "react";
import { Building2, GraduationCap, BookOpen, Users2 } from "lucide-react";
import { UserRole } from "@/lib/validations/auth";
import type { TabConfig, ProfilePermissions } from "@/types/profile-types";
import { calculateProfilePermissions } from "@/lib/permissions";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/shared/icons";

// Import tab content components
import OverviewTab from "./tabs/OverviewTab";
import PostsTab from "./tabs/PostsTab";
import CoursesTab from "./tabs/CoursesTab";
import JobsTab from "./tabs/JobsTab";
import ResearchTab from "./tabs/ResearchTab";
import SchoolsTab from "./tabs/SchoolsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import SettingsTab from "./tabs/SettingsTab";
import MembersTab from "./tabs/MembersTab";
import { ClubsTab } from "./tabs/ClubsTab";
import { EventsTab } from "./tabs/EventsTab";
import { CourseData, JobData, ResearchData, UserData } from "@/types/types";

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
      permission: "canCreateCourses",
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
      value: "schools",
      label: "Schools",
      icon: Building2,
      permission: "canManageAcademic",
      roles: [UserRole.INSTITUTION],
    },
    {
      value: "clubs",
      label: "Clubs",
      icon: Icons.chart,
      permission: "canViewPrivate",
      roles: [UserRole.INSTITUTION],
    },
    {
      value: "events",
      label: "Events",
      icon: Icons.settings,
      permission: "canEdit",
      roles: [UserRole.INSTITUTION],
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
      value: "members",
      label: "Members",
      icon: Users2,
      permission: "canEdit",
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
    { value: "jobs", label: "Jobs", icon: Icons.job, roles: [UserRole.ADMIN] },
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

// Helper function to get role-based tabs with permission filtering
const getRoleBasedTabs = (
  role: UserRole,
  permissions: ProfilePermissions
): TabConfig[] => {
  const tabsForRole = TAB_CONFIGURATIONS[role] || TAB_CONFIGURATIONS.STUDENT;

  return tabsForRole.filter((tab) => {
    // If tab has a permission requirement, check if user has that permission
    if (tab.permission) {
      return permissions[tab.permission];
    }
    return true;
  });
};

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
    user.role as unknown as UserRole,
    loggedInUserRole as unknown as UserRole
  );

  const roleTabs = getRoleBasedTabs(user.role as unknown as UserRole, permissions);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="bg-card overflow-hidden rounded-2xl shadow-sm">
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <div className="border-b">
          <TabsList className="flex w-full justify-start p-0 bg-transparent h-auto">
            {roleTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50"
                >
                  <IconComponent className="size-4" />
                  <span className="hidden md:block">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Contents with proper permission checks and data passing */}
        <TabsContent value="overview" className="space-y-2 p-3">
          <OverviewTab
            user={user}
            courses={courses}
            jobs={jobs}
            loggedInUserId={loggedInUserId}
            permissions={permissions}
            loading={loading?.courses || loading?.jobs}
          />
        </TabsContent>

        <TabsContent value="posts" className="mx-auto max-w-2xl p-6">
          <PostsTab user={user} permissions={permissions} />
        </TabsContent>

        <TabsContent value="courses" className="p-3">
          <CoursesTab
            user={user}
            courses={courses}
            isCurrentUser={user.id === loggedInUserId}
          />
        </TabsContent>

        <TabsContent value="jobs" className="p-4">
          <JobsTab
            jobs={jobs}
            userRole={user.role as unknown as UserRole}
            loggedInUserId={loggedInUserId}
            permissions={permissions}
            loading={loading?.jobs}
          />
        </TabsContent>

        <TabsContent value="research" className="p-3">
          <ResearchTab
            researches={researches}
            userRole={user.role as unknown as UserRole}
            loggedInUserId={loggedInUserId}
            permissions={permissions}
            loading={loading?.researches}
          />
        </TabsContent>

        {/* Institution-specific tabs */}
        <TabsContent value="schools" className="p-4">
          <SchoolsTab user={user} isCurrentUser={user.id === loggedInUserId} />
        </TabsContent>

        <TabsContent value="analytics" className="p-4">
          <AnalyticsTab user={user} permissions={permissions} />
        </TabsContent>

        <TabsContent value="settings" className="p-4">
          <SettingsTab
            user={user}
            loggedInUserId={loggedInUserId}
            permissions={permissions}
          />
        </TabsContent>

        {/* Organization-specific tabs */}
        <TabsContent value="members" className="p-3">
          <MembersTab
            user={user}
            loggedInUserId={loggedInUserId}
            permissions={permissions}
          />
        </TabsContent>

        {/* Additional tabs for institutions */}
        <TabsContent value="clubs">
          <ClubsTab
            username={user.username || user.id}
            isOwnProfile={user.id === loggedInUserId}
            userRole={user.role}
          />
        </TabsContent>

        <TabsContent value="events">
          <EventsTab
            username={user.username || user.id}
            isOwnProfile={user.id === loggedInUserId}
            userRole={user.role}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
