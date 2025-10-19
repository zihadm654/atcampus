import type { User as BetterAuthUser } from "better-auth";
import type { auth } from "@/lib/auth";
import type { authClient } from "@/lib/auth-client";

export type Session = typeof auth.$Infer.Session;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Invitation = typeof authClient.$Infer.Invitation;

// Define our custom user properties
export interface CustomUserProperties {
  role: "STUDENT" | "PROFESSOR" | "INSTITUTION" | "ORGANIZATION" | "ADMIN";
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  username?: string;
  institution?: string;
  instituteId?: string;
  phone?: string;
}

// Extended user type that combines better-auth User with our custom properties
export type ExtendedUser = BetterAuthUser & CustomUserProperties;

// Session user type with all properties
export interface SessionUser extends ExtendedUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Type guard to check if user has a specific role
export function hasRole(
  user: ExtendedUser,
  role: CustomUserProperties["role"]
): boolean {
  return user.role === role;
}

// Type guard to check if user has one of several roles
export function hasAnyRole(
  user: ExtendedUser,
  roles: CustomUserProperties["role"][]
): boolean {
  return roles.includes(user.role);
}

// Type guard to check if user has a specific status
export function hasStatus(
  user: ExtendedUser,
  status: CustomUserProperties["status"]
): boolean {
  return user.status === status;
}

// Check if user can create organizations
export function canCreateOrganizations(user: ExtendedUser): boolean {
  return user.role === "INSTITUTION" || user.role === "ORGANIZATION";
}

// Check if user is an admin
export function isAdmin(user: ExtendedUser): boolean {
  return user.role === "ADMIN";
}

// Check if user is approved
export function isApproved(user: ExtendedUser): boolean {
  return user.status === "ACTIVE" || user.status === "SUSPENDED";
}

// Check if user is pending approval
export function isPending(user: ExtendedUser): boolean {
  return user.status === "PENDING";
}

// Check if user is rejected
export function isRejected(user: ExtendedUser): boolean {
  return user.status === "REJECTED";
}

// Check if user can review courses (admins and professors)
export function canReviewCourses(user: ExtendedUser): boolean {
  return user.role === "ADMIN" || user.role === "PROFESSOR";
}
