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
      </div>
    </Fragment>
  );
}
