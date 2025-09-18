import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export interface ValidationOptions {
  requiredRole?: string[];
  requiredStatus?: string[];
  redirectTo?: string;
  allowInactive?: boolean;
}

export interface ValidationResult {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  hasRole: (roles: string | string[]) => boolean;
  hasStatus: (statuses: string | string[]) => boolean;
}

/**
 * Server-side role and status validation utility
 * This approach eliminates the need for extra API calls and provides better performance
 */
export async function validateUserAccess(options: ValidationOptions = {}): Promise<ValidationResult> {
  const {
    requiredRole,
    requiredStatus = ["ACTIVE"],
    redirectTo = "/login",
    allowInactive = false
  } = options;

  const user = await getCurrentUser();
  
  if (!user) {
    redirect(redirectTo);
  }

  // Check user status
  if (!allowInactive && requiredStatus.length > 0) {
    const hasValidStatus = Array.isArray(requiredStatus) 
      ? requiredStatus.includes(user.status)
      : user.status === requiredStatus;
    
    if (!hasValidStatus) {
      // Handle specific status redirects
      if (user.status === "PENDING") {
        redirect("/pending-approval");
      } else if (user.status === "REJECTED") {
        redirect("/rejected-account");
      } else if (user.status === "SUSPENDED") {
        redirect("/suspended-account");
      }
      
      redirect(redirectTo);
    }
  }

  // Check user role
  if (requiredRole && requiredRole.length > 0) {
    const hasValidRole = Array.isArray(requiredRole) 
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;
    
    if (!hasValidRole) {
      redirect("/unauthorized");
    }
  }

  // Handle special cases for organizations and institutions
  if ((user.role === "ORGANIZATION" || user.role === "INSTITUTION") && user.status !== "ACTIVE") {
    if (user.status === "PENDING") {
      redirect("/pending-approval");
    } else if (user.status === "REJECTED") {
      redirect("/rejected-account");
    }
  }

  return {
    user,
    hasRole: (roles) => {
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    hasStatus: (statuses) => {
      const statusArray = Array.isArray(statuses) ? statuses : [statuses];
      return statusArray.includes(user.status);
    }
  };
}

/**
 * Validate admin access specifically
 */
export async function validateAdminAccess(redirectTo: string = "/") {
  return validateUserAccess({
    requiredRole: ["ADMIN"],
    redirectTo
  });
}

/**
 * Validate organization access
 */
export async function validateOrganizationAccess() {
  return validateUserAccess({
    requiredRole: ["ORGANIZATION", "ADMIN"],
    requiredStatus: ["ACTIVE"]
  });
}

/**
 * Validate institution access
 */
export async function validateInstitutionAccess() {
  return validateUserAccess({
    requiredRole: ["INSTITUTION", "ADMIN"],
    requiredStatus: ["ACTIVE"]
  });
}

/**
 * Validate professor access
 */
export async function validateProfessorAccess() {
  return validateUserAccess({
    requiredRole: ["PROFESSOR", "ADMIN"]
  });
}

/**
 * Validate student access
 */
export async function validateStudentAccess() {
  return validateUserAccess({
    requiredRole: ["STUDENT", "PROFESSOR", "ADMIN"]
  });
}

/**
 * Validate any authenticated user
 */
export async function validateAuthenticatedUser() {
  return validateUserAccess({
    allowInactive: true
  });
}