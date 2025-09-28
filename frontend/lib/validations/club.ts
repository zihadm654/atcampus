import * as z from "zod";

// Club status and type enums
export const clubStatusEnum = z.enum(["DRAFT", "ACTIVE", "INACTIVE", "SUSPENDED"]);
export const clubTypeEnum = z.enum([
  "ACADEMIC", "SOCIAL", "PROFESSIONAL", "CULTURAL", "SPORTS", 
  "VOLUNTEER", "HOBBY", "TECHNOLOGY", "ARTS", "MUSIC", "OTHER"
]);
export const clubMemberRoleEnum = z.enum([
  "MEMBER", "PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER", "ADVISOR"
]);

// Base club schema
export const clubSchema = z.object({
  name: z.string().trim().min(1, "Club name is required").max(200, "Club name must be at most 200 characters"),
  description: z
    .string()
    .min(1, "Club description is required")
    .max(5000, "Description must be at most 5000 characters"),
  type: clubTypeEnum,
  status: clubStatusEnum.default("DRAFT"),
  
  // Club details
  mission: z.string().max(2000, "Mission must be at most 2000 characters").optional(),
  vision: z.string().max(2000, "Vision must be at most 2000 characters").optional(),
  values: z.array(z.string().max(100, "Value must be at most 100 characters")).max(10, "Maximum 10 values allowed").optional(),
  
  // Contact and location
  location: z.string().max(500, "Location must be at most 500 characters").optional(),
  meetingSchedule: z.string().max(500, "Meeting schedule must be at most 500 characters").optional(),
  contactEmail: z.string().email("Must be a valid email address").optional(),
  contactPhone: z.string().max(20, "Phone must be at most 20 characters").optional(),
  websiteUrl: z.string().url("Must be a valid URL").optional().nullable(),
  socialMedia: z.object({
    facebook: z.string().url("Must be a valid URL").optional().nullable(),
    instagram: z.string().url("Must be a valid URL").optional().nullable(),
    twitter: z.string().url("Must be a valid URL").optional().nullable(),
    linkedin: z.string().url("Must be a valid URL").optional().nullable(),
    discord: z.string().url("Must be a valid URL").optional().nullable(),
  }).optional(),
  
  // Membership settings
  isOpenMembership: z.boolean().default(true),
  maxMembers: z.coerce.number().int().min(1, "Max members must be at least 1").max(1000, "Max members must be at most 1000").optional(),
  membershipRequirements: z.string().max(1000, "Requirements must be at most 1000 characters").optional(),
  approvalRequired: z.boolean().default(false),
  
  // Media and branding
  coverPhoto: z.string().url("Must be a valid URL").optional().nullable(),
  logo: z.string().url("Must be a valid URL").optional().nullable(),
  bannerImage: z.string().url("Must be a valid URL").optional().nullable(),
  
  // Organization context
  organizationId: z.string().min(1, "Organization is required"),
  facultyId: z.string().optional().nullable(),
  
  // Additional metadata
  tags: z.array(z.string().max(50, "Tag must be at most 50 characters")).max(20, "Maximum 20 tags allowed").optional(),
  categories: z.array(z.string().max(100, "Category must be at most 100 characters")).max(10, "Maximum 10 categories allowed").optional(),
  foundedYear: z.coerce.number().int().min(1900, "Founded year must be after 1900").max(new Date().getFullYear(), "Founded year cannot be in the future").optional(),
});

// Create club schema (used for creating new clubs)
export const createClubSchema = clubSchema.omit({ 
  status: true, // Default to DRAFT
  organizationId: true // Will be set from session
});

// Update club schema (used for updating existing clubs)
export const updateClubSchema = clubSchema.partial();

// Club membership schemas
export const joinClubSchema = z.object({
  clubId: z.string().min(1, "Club ID is required"),
  userId: z.string().min(1, "User ID is required"),
  applicationMessage: z.string().max(500, "Application message must be at most 500 characters").optional(),
});

export const updateClubMemberSchema = z.object({
  clubId: z.string().min(1, "Club ID is required"),
  userId: z.string().min(1, "User ID is required"),
  role: clubMemberRoleEnum,
  isActive: z.boolean().optional(),
  position: z.string().max(100, "Position must be at most 100 characters").optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
});

// Club like schema
export const clubLikeSchema = z.object({
  clubId: z.string().min(1, "Club ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

// Club event linking schema
export const linkClubEventSchema = z.object({
  clubId: z.string().min(1, "Club ID is required"),
  eventId: z.string().min(1, "Event ID is required"),
  isFeatured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

// Club search and filter schema
export const clubFilterSchema = z.object({
  type: clubTypeEnum.optional(),
  status: clubStatusEnum.optional(),
  organizationId: z.string().optional(),
  facultyId: z.string().optional(),
  isOpenMembership: z.boolean().optional(),
  search: z.string().max(100, "Search must be at most 100 characters").optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Club member management schemas
export const approveMemberSchema = z.object({
  clubId: z.string().min(1, "Club ID is required"),
  userId: z.string().min(1, "User ID is required"),
  approved: z.boolean(),
  rejectionReason: z.string().max(500, "Rejection reason must be at most 500 characters").optional(),
});

export const removeMemberSchema = z.object({
  clubId: z.string().min(1, "Club ID is required"),
  userId: z.string().min(1, "User ID is required"),
  reason: z.string().max(500, "Reason must be at most 500 characters").optional(),
});

// Type exports
export type TClub = z.infer<typeof clubSchema>;
export type TCreateClub = z.infer<typeof createClubSchema>;
export type TUpdateClub = z.infer<typeof updateClubSchema>;
export type TJoinClub = z.infer<typeof joinClubSchema>;
export type TUpdateClubMember = z.infer<typeof updateClubMemberSchema>;
export type TClubLike = z.infer<typeof clubLikeSchema>;
export type TLinkClubEvent = z.infer<typeof linkClubEventSchema>;
export type TClubFilter = z.infer<typeof clubFilterSchema>;
export type TApproveMember = z.infer<typeof approveMemberSchema>;
export type TRemoveMember = z.infer<typeof removeMemberSchema>;

export type TClubStatus = z.infer<typeof clubStatusEnum>;
export type TClubType = z.infer<typeof clubTypeEnum>;
export type TClubMemberRole = z.infer<typeof clubMemberRoleEnum>;