import React from "react";
import { Fragment } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import type {
  ProfileUserData,
  ProfilePermissions,
} from "@/types/profile-types";
import type { UserData, UserSkillData } from "@/types/types";

import SkillsSection from "../sections/SkillsSection";
import CoursesSection from "../sections/CoursesSection";
import ActivitySection from "../sections/ActivitySection";
import InstitutionOverview from "../sections/InstitutionOverview";
import OrganizationOverview from "../sections/OrganizationOverview";
import ProfessorOverview from "../sections/ProfessorOverview";

interface OverviewTabProps {
  user: UserData;
  courses: any;
  jobs: any;
  loggedInUserId: string;
  permissions: ProfilePermissions;
  loading?: boolean;
}

export default function OverviewTab({
  user,
  courses,
  jobs,
  loggedInUserId,
  permissions,
  loading,
}: OverviewTabProps) {
  const isOwnProfile = user.id === loggedInUserId;

  // Role-specific overview layouts
  switch (user.role) {
    case "INSTITUTION":
      return (
        <InstitutionOverview
          user={user}
          // organizationData={user.organizations || []}
          permissions={permissions}
          isOwnProfile={isOwnProfile}
        />
      );

    case "ORGANIZATION":
      return (
        <OrganizationOverview
          user={user}
          members={user.members || []}
          jobs={jobs}
          permissions={permissions}
          isOwnProfile={isOwnProfile}
        />
      );

    case "PROFESSOR":
      return (
        <ProfessorOverview
          user={user}
          courses={courses}
          research={user.research || []}
          permissions={permissions}
          isOwnProfile={isOwnProfile}
        />
      );

    case "STUDENT":
    case "ADMIN":
    default:
      return (
        <StudentOverview
          user={user}
          courses={courses}
          jobs={jobs}
          permissions={permissions}
          isOwnProfile={isOwnProfile}
        />
      );
  }
}

// Student Overview Component
function StudentOverview({
  user,
  courses,
  jobs,
  permissions,
  isOwnProfile,
}: {
  user: UserData;
  courses: any[];
  jobs: any[];
  permissions: ProfilePermissions;
  isOwnProfile: boolean;
}) {
  // Transform userSkills to match UserSkillData type expected by SkillsSection
  const userSkillsData: UserSkillData[] =
    user.userSkills?.map((skill) => ({
      id: skill.id,
      title: skill.title,
      level: skill.level,
      yearsOfExperience: skill.yearsOfExperience ?? 0,
      skillId: skill.skillId,
      skill: {
        name: skill.title,
        category: skill.skill?.category || null,
      },
      _count: {
        endorsements: skill._count?.endorsements || 0,
      },
    })) || [];

  return (
    <Fragment>
      <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
        {/* Skills Section */}
        <SkillsSection
          userSkills={userSkillsData}
          userId={user.id}
          canEdit={permissions.canEdit}
          limit={5}
        />

        {/* Courses Section */}
        <CoursesSection
          enrollments={courses}
          userRole={user.role}
          canEdit={permissions.canEdit}
          limit={3}
        />
      </div>

      <div className="space-y-2">
        {/* Activity Section */}
        <ActivitySection
          jobs={jobs}
          research={user.research || []}
          userRole={user.role}
          userId={user.id}
          canEdit={permissions.canEdit}
          showHeader={false}
        />

        {/* Achievements Section */}
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
          <CardHeader className="flex items-center justify-between pb-4">
            <CardTitle className="flex items-center text-lg font-medium">
              <Star className="size-7 pr-2" />
              Achievements
            </CardTitle>
            <CardAction>
              {permissions.canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                >
                  <span>See More</span>
                  <Icons.chevronRight className="size-5" />
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
              <div className="flex flex-col items-center">
                <Star className="size-10" />
                <p className="text-sm mt-2">No achievements yet</p>
                {permissions.canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-full"
                  >
                    <Icons.add className="size-4 mr-2" />
                    Add Achievement
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Fragment>
  );
}
