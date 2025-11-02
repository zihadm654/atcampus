import type { ProfilePermissions } from "@/types/profile-types";
import type { UserData, UserSkillData } from "@/types/types";
import ActivitySection from "../sections/ActivitySection";
import CoursesSection from "../sections/CoursesSection";
import InstitutionOverview from "../sections/InstitutionOverview";
import OrganizationOverview from "../sections/OrganizationOverview";
import ProfessorOverview from "../sections/ProfessorOverview";
import SkillsSection from "../sections/SkillsSection";

interface OverviewTabProps {
  user: UserData;
  courses: any;
  jobs: any;
  researches: any;
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
  researches,
}: OverviewTabProps) {
  const isOwnProfile = user.id === loggedInUserId;

  // Role-specific overview layouts
  switch (user.role) {
    case "INSTITUTION":
      return (
        <InstitutionOverview
          isOwnProfile={isOwnProfile}
          permissions={permissions}
          user={user}
        />
      );

    case "ORGANIZATION":
      return (
        <OrganizationOverview
          isOwnProfile={isOwnProfile}
          jobs={jobs}
          members={user.members || []}
          permissions={permissions}
          user={user}
        />
      );

    case "PROFESSOR":
      return (
        <ProfessorOverview
          courses={courses}
          isOwnProfile={isOwnProfile}
          permissions={permissions}
          researches={researches || []}
          user={user}
        />
      );

    default:
      return (
        <StudentOverview
          courses={courses}
          isOwnProfile={isOwnProfile}
          jobs={jobs}
          permissions={permissions}
          user={user}
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
      skillId: skill.skillId,
      skill: {
        name: skill.skill?.name,
        category: skill.skill?.category || null,
        yearsOfExperience: skill.skill?.yearsOfExperience || 0,
        difficulty: skill.skill?.difficulty || "BEGINNER",
      },
      _count: {
        endorsements: skill._count?.endorsements || 0,
      },
    })) || [];

  return (
    <>
      <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
        {/* Skills Section */}
        <SkillsSection
          canEdit={permissions.canEdit}
          limit={5}
          user={user}
          userId={user.id}
          userSkills={userSkillsData}
        />

        {/* Courses Section */}
        <CoursesSection
          canEdit={permissions.canEdit}
          enrollments={courses}
          limit={3}
          userRole={user.role}
        />
      </div>

      <div className="space-y-2">
        {/* Activity Section */}
        <ActivitySection
          canEdit={permissions.canEdit}
          jobs={jobs}
          research={user.research || []}
          showHeader={false}
          userId={user.id}
          userRole={user.role}
        />
      </div>
    </>
  );
}
