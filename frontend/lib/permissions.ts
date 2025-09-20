import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import type { ProfilePermissions } from "@/types/profile-types";
import type { UserRole } from "@/lib/validations/auth";

const statements = {
  ...defaultStatements,
  posts: ["create", "read", "update", "delete", "update:own", "delete:own"],
  jobs: ["create", "read", "update", "delete", "update:own", "delete:own"],
  research: ["create", "read", "update", "delete", "update:own", "delete:own"],
  organizations: ["create", "read", "update", "delete", "update:own", "delete:own"],
  schools: ["create", "read", "update", "delete", "update:own", "delete:own"],
  faculties: ["create", "read", "update", "delete", "update:own", "delete:own"],
  courses: ["create", "read", "update", "delete", "update:own", "delete:own"],
  professors: ["assign", "unassign", "manage"],
  members: ["create", "read", "update", "delete", "invite", "remove"],
  analytics: ["read", "view_private"],
  settings: ["read", "update"],
} as const;

export const ac = createAccessControl(statements);

export const roles = {
  STUDENT: ac.newRole({
    posts: ["create", "read", "update:own", "delete:own"],
    research: ["create", "read", "update:own", "delete:own"],
    courses: ["read"],
    jobs: ["read"],
  }),
  PROFESSOR: ac.newRole({
    posts: ["create", "read", "update:own", "delete:own"],
    research: ["create", "read", "update:own", "delete:own"],
    courses: ["create", "read", "update:own", "delete:own"],
    members: ["read"],
  }),
  INSTITUTION: ac.newRole({
    posts: ["create", "read", "update:own", "delete:own"],
    organizations: ["create", "read", "update:own", "delete:own"],
    research: ["create", "read", "update:own", "delete:own"],
    schools: ["create", "read", "update:own", "delete:own"],
    faculties: ["create", "read", "update:own", "delete:own"],
    courses: ["create", "read", "update:own", "delete:own"],
    professors: ["assign", "unassign", "manage"],
    members: ["create", "read", "update", "delete", "invite", "remove"],
    analytics: ["read", "view_private"],
    settings: ["read", "update"],
  }),
  ADMIN: ac.newRole({
    posts: ["create", "read", "update", "delete", "update:own", "delete:own"],
    organizations: ["create", "read", "update", "delete", "update:own", "delete:own"],
    jobs: ["create", "read", "update", "delete", "update:own", "delete:own"],
    research: ["create", "read", "update", "delete", "update:own", "delete:own"],
    schools: ["create", "read", "update", "delete", "update:own", "delete:own"],
    faculties: ["create", "read", "update", "delete", "update:own", "delete:own"],
    courses: ["create", "read", "update", "delete", "update:own", "delete:own"],
    professors: ["assign", "unassign", "manage"],
    members: ["create", "read", "update", "delete", "invite", "remove"],
    analytics: ["read", "view_private"],
    settings: ["read", "update"],
    ...adminAc.statements,
  }),
  ORGANIZATION: ac.newRole({
    posts: ["create", "read", "update:own", "delete:own"],
    research: ["create", "read", "update:own", "delete:own"],
    jobs: ["create", "read", "update:own", "delete:own"],
    members: ["create", "read", "update", "delete", "invite", "remove"],
  }),
};

// Helper function to calculate profile permissions based on user role and relationship
export function calculateProfilePermissions(
  profileUserId: string,
  loggedInUserId: string,
  profileUserRole: UserRole,
  loggedInUserRole: UserRole
): ProfilePermissions {
  const isOwnProfile = profileUserId === loggedInUserId;
  const isAdmin = loggedInUserRole === "ADMIN";

  return {
    canEdit: isOwnProfile || isAdmin,
    canDelete: isAdmin,
    canManageAcademic:
      (profileUserRole === "INSTITUTION" && isOwnProfile) ||
      (profileUserRole === "INSTITUTION" && isAdmin),
    canAssignProfessors:
      (profileUserRole === "INSTITUTION" && isOwnProfile) ||
      (profileUserRole === "INSTITUTION" && isAdmin),
    canCreateSchools:
      (profileUserRole === "INSTITUTION" && isOwnProfile) ||
      (profileUserRole === "INSTITUTION" && isAdmin),
    canCreateFaculties:
      (profileUserRole === "INSTITUTION" && isOwnProfile) ||
      (profileUserRole === "INSTITUTION" && isAdmin),
    canCreateCourses:
      (profileUserRole === "PROFESSOR" && isOwnProfile) ||
      (profileUserRole === "INSTITUTION" && isOwnProfile) ||
      isAdmin,
    canViewPrivate:
      isOwnProfile ||
      isAdmin ||
      (profileUserRole === "INSTITUTION" && loggedInUserRole === "INSTITUTION"),
  };
}
