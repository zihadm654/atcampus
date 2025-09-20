import { z } from 'zod';
import { UserRole } from '@prisma/client';

// ============================================================================
// ORGANIZATION VALIDATION SCHEMAS
// ============================================================================

export const organizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must not exceed 100 characters')
    .trim(),
  slug: z
    .string()
    .min(2, 'Organization slug must be at least 2 characters')
    .max(50, 'Organization slug must not exceed 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    )
    .trim(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  logo: z.string().url('Please enter a valid logo URL').optional(),
});

export const createOrganizationSchema = organizationSchema;
export const updateOrganizationSchema = organizationSchema.partial();

// ============================================================================
// SCHOOL VALIDATION SCHEMAS
// ============================================================================

export const schoolSchema = z.object({
  name: z
    .string()
    .min(2, 'School name must be at least 2 characters')
    .max(100, 'School name must not exceed 100 characters')
    .trim(),
  shortName: z
    .string()
    .max(20, 'Short name must not exceed 20 characters')
    .optional(),
  slug: z
    .string()
    .min(2, 'School slug must be at least 2 characters')
    .max(50, 'School slug must not exceed 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    )
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  logo: z.string().url('Please enter a valid logo URL').optional(),
  coverPhoto: z.string().url('Please enter a valid cover photo URL').optional(),
  organizationId: z.string().cuid('Invalid organization ID'),
});

export const createSchoolSchema = schoolSchema;
export const updateSchoolSchema = schoolSchema.partial().extend({
  id: z.string().cuid('Invalid school ID'),
});

// ============================================================================
// FACULTY VALIDATION SCHEMAS
// ============================================================================

export const facultySchema = z.object({
  name: z
    .string()
    .min(2, 'Faculty name must be at least 2 characters')
    .max(100, 'Faculty name must not exceed 100 characters')
    .trim(),
  shortName: z
    .string()
    .max(20, 'Short name must not exceed 20 characters')
    .optional(),
  slug: z
    .string()
    .min(2, 'Faculty slug must be at least 2 characters')
    .max(50, 'Faculty slug must not exceed 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    )
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  logo: z.string().url('Please enter a valid logo URL').optional(),
  coverPhoto: z.string().url('Please enter a valid cover photo URL').optional(),
  schoolId: z.string().cuid('Invalid school ID'),
});

export const createFacultySchema = facultySchema;
export const updateFacultySchema = facultySchema.partial().extend({
  id: z.string().cuid('Invalid faculty ID'),
});

// ============================================================================
// MEMBER & INVITATION VALIDATION SCHEMAS
// ============================================================================

export const userRoleSchema = z.nativeEnum(UserRole);

export const inviteProfessorSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  facultyId: z.string().cuid('Invalid faculty ID'),
  role: z.string(),
  message: z
    .string()
    .max(500, 'Message must not exceed 500 characters')
    .optional(),
});

export const memberAssignmentSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  organizationId: z.string().cuid('Invalid organization ID'),
  facultyId: z.string().cuid('Invalid faculty ID').optional(),
  role: z.string(),
  permissions: z.array(z.string()).default([]),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().cuid('Invalid member ID'),
  role: z.string(),
  facultyId: z.string().cuid('Invalid faculty ID').optional(),
});

// ============================================================================
// PROFESSOR PROFILE VALIDATION SCHEMAS
// ============================================================================

export const professorProfileSchema = z.object({
  title: z.string().max(100, 'Title must not exceed 100 characters').optional(),
  department: z
    .string()
    .max(100, 'Department must not exceed 100 characters')
    .optional(),
  office: z
    .string()
    .max(100, 'Office location must not exceed 100 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  researchInterests: z
    .array(
      z.string().max(100, 'Research interest must not exceed 100 characters')
    )
    .max(10, 'Maximum 10 research interests allowed')
    .default([]),
});

export const createProfessorProfileSchema = professorProfileSchema.extend({
  memberId: z.string().cuid('Invalid member ID'),
  facultyId: z.string().cuid('Invalid faculty ID'),
});

export const updateProfessorProfileSchema = professorProfileSchema.partial();

// ============================================================================
// PERMISSION VALIDATION SCHEMAS
// ============================================================================

export const permissionContextSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  organizationId: z.string().cuid('Invalid organization ID').optional(),
  schoolId: z.string().cuid('Invalid school ID').optional(),
  facultyId: z.string().cuid('Invalid faculty ID').optional(),
});

export const accessValidationSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  organizationId: z.string().cuid('Invalid organization ID'),
  requiredPermissions: z.array(z.string()).optional(),
});

// ============================================================================
// HIERARCHY QUERY VALIDATION SCHEMAS
// ============================================================================

export const hierarchyQuerySchema = z.object({
  organizationId: z.string().cuid('Invalid organization ID'),
  includeInactive: z.boolean().default(false),
  includeStats: z.boolean().default(true),
});

export const schoolQuerySchema = z.object({
  organizationId: z.string().cuid('Invalid organization ID'),
  includeInactive: z.boolean().default(false),
  includeFaculties: z.boolean().default(false),
});

export const facultyQuerySchema = z
  .object({
    schoolId: z.string().cuid('Invalid school ID').optional(),
    organizationId: z.string().cuid('Invalid organization ID').optional(),
    includeInactive: z.boolean().default(false),
    includeProfessors: z.boolean().default(false),
    includeCourses: z.boolean().default(false),
  })
  .refine((data) => data.schoolId || data.organizationId, {
    message: 'Either schoolId or organizationId must be provided',
    path: ['schoolId'],
  });

// ============================================================================
// BULK OPERATIONS VALIDATION SCHEMAS
// ============================================================================

export const bulkInviteProfessorsSchema = z.object({
  invitations: z
    .array(inviteProfessorSchema)
    .min(1, 'At least one invitation is required')
    .max(50, 'Maximum 50 invitations allowed per batch'),
  organizationId: z.string().cuid('Invalid organization ID'),
});

export const bulkUpdateMembersSchema = z.object({
  updates: z
    .array(updateMemberRoleSchema)
    .min(1, 'At least one update is required')
    .max(100, 'Maximum 100 updates allowed per batch'),
  organizationId: z.string().cuid('Invalid organization ID'),
});

// ============================================================================
// SEARCH AND FILTER VALIDATION SCHEMAS
// ============================================================================

export const hierarchySearchSchema = z.object({
  query: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must not exceed 100 characters')
    .trim(),
  organizationId: z.string().cuid('Invalid organization ID'),
  type: z.enum(['schools', 'faculties', 'professors', 'all']).default('all'),
  limit: z.number().min(1).max(100).default(20),
});

export const memberFilterSchema = z.object({
  organizationId: z.string().cuid('Invalid organization ID'),
  roles: z.array(z.string()).optional(),
  facultyId: z.string().cuid('Invalid faculty ID').optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate organization slug format and uniqueness requirements
 */
export const validateSlugFormat = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
};

/**
 * Validate email format for professor invitations
 */
export const validateAcademicEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate research interests format
 */
export const validateResearchInterests = (interests: string[]): boolean => {
  return interests.every(
    (interest) => interest.trim().length > 0 && interest.trim().length <= 100
  );
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export type SchoolInput = z.infer<typeof schoolSchema>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;

export type FacultyInput = z.infer<typeof facultySchema>;
export type CreateFacultyInput = z.infer<typeof createFacultySchema>;
export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;

export type InviteProfessorInput = z.infer<typeof inviteProfessorSchema>;
export type MemberAssignmentInput = z.infer<typeof memberAssignmentSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export type ProfessorProfileInput = z.infer<typeof professorProfileSchema>;
export type CreateProfessorProfileInput = z.infer<
  typeof createProfessorProfileSchema
>;
export type UpdateProfessorProfileInput = z.infer<
  typeof updateProfessorProfileSchema
>;

export type PermissionContextInput = z.infer<typeof permissionContextSchema>;
export type AccessValidationInput = z.infer<typeof accessValidationSchema>;

export type HierarchyQueryInput = z.infer<typeof hierarchyQuerySchema>;
export type SchoolQueryInput = z.infer<typeof schoolQuerySchema>;
export type FacultyQueryInput = z.infer<typeof facultyQuerySchema>;

export type BulkInviteProfessorsInput = z.infer<
  typeof bulkInviteProfessorsSchema
>;
export type BulkUpdateMembersInput = z.infer<typeof bulkUpdateMembersSchema>;

export type HierarchySearchInput = z.infer<typeof hierarchySearchSchema>;
export type MemberFilterInput = z.infer<typeof memberFilterSchema>;
