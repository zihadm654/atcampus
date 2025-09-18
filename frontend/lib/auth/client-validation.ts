import { useSession } from "@/lib/auth-client";

export interface ClientValidationOptions {
  requiredRole?: string[];
  requiredStatus?: string[];
  allowInactive?: boolean;
}

/**
 * Client-side role and status validation utility
 * Uses better-auth's useSession hook for efficient validation
 */
export function useClientValidation(options: ClientValidationOptions = {}) {
  const { requiredRole, requiredStatus = ["ACTIVE"], allowInactive = false } = options;

  const { data: session, isPending } = useSession();

  const user = session?.user;

  const hasRole = (roles: string | string[]): boolean => {
    if (!user?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasStatus = (statuses: string | string[]): boolean => {
    if (!user?.status) return false;
    const statusArray = Array.isArray(statuses) ? statuses : [statuses];
    return statusArray.includes(user.status);
  };

  const isValid = (): boolean => {
    if (!user) return false;

    if (!allowInactive && requiredStatus.length > 0) {
      const hasValidStatus = Array.isArray(requiredStatus)
        ? requiredStatus.includes(user.status)
        : user.status === requiredStatus;

      if (!hasValidStatus) return false;
    }

    if (requiredRole && requiredRole.length > 0) {
      const hasValidRole = Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole;

      if (!hasValidRole) return false;
    }

    // Special handling for organizations and institutions
    if ((user.role === "ORGANIZATION" || user.role === "INSTITUTION") && user.status !== "ACTIVE") {
      return false;
    }

    return true;
  };

  return {
    user,
    isLoading: isPending,
    hasRole,
    hasStatus,
    isValid: isValid(),
    isAuthenticated: !!user
  };
}

/**
 * Hook for admin validation
 */
export function useAdminValidation() {
  return useClientValidation({
    requiredRole: ["ADMIN"]
  });
}

/**
 * Hook for organization validation
 */
export function useOrganizationValidation() {
  return useClientValidation({
    requiredRole: ["ORGANIZATION", "ADMIN"],
    requiredStatus: ["ACTIVE"]
  });
}

/**
 * Hook for institution validation
 */
export function useInstitutionValidation() {
  return useClientValidation({
    requiredRole: ["INSTITUTION", "ADMIN"],
    requiredStatus: ["ACTIVE"]
  });
}

/**
 * Hook for professor validation
 */
export function useProfessorValidation() {
  return useClientValidation({
    requiredRole: ["PROFESSOR", "ADMIN"]
  });
}

/**
 * Hook for student validation
 */
export function useStudentValidation() {
  return useClientValidation({
    requiredRole: ["STUDENT", "PROFESSOR", "ADMIN"]
  });
}

/**
 * Hook for any authenticated user
 */
export function useAuthenticatedUser() {
  return useClientValidation({
    allowInactive: true
  });
}