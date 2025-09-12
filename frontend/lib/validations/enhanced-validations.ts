import { z } from "zod";

// Enhanced course approval schema with comprehensive validation
export const courseApprovalSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED", "NEEDS_REVISION"]),
    comments: z.string().max(2000).optional(),
    internalNotes: z.string().max(1000).optional(),

    // Scoring system (1-10 scale for production)
    contentScore: z.number().min(1).max(10).optional(),
    academicRigor: z.number().min(1).max(10).optional(),
    resourceScore: z.number().min(1).max(10).optional(),
    innovationScore: z.number().min(1).max(10).optional(),
    overallScore: z.number().min(1).max(10).optional(),

    // Feedback arrays
    requiredChanges: z.array(z.string().max(500)).max(20).default([]),
    suggestedChanges: z.array(z.string().max(500)).max(20).default([]),

    // Workflow fields
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
    revisionDeadline: z.string().datetime().optional(),
    estimatedReviewTime: z.number().min(1).max(168).optional(), // Max 1 week in hours

    // Review criteria
    reviewCriteria: z.array(z.string()).default([]),
    conflictOfInterest: z.boolean().default(false),
    reviewMethodology: z.string().max(500).optional(),
});

// Enhanced course schema with production validation
export const courseSchema = z.object({
    code: z.string()
        .min(2, "Course code must be at least 2 characters")
        .max(20, "Course code cannot exceed 20 characters")
        .regex(/^[A-Z0-9-]+$/, "Course code must contain only uppercase letters, numbers, and hyphens"),

    title: z.string()
        .min(3, "Course title must be at least 3 characters")
        .max(200, "Course title cannot exceed 200 characters")
        .trim(),

    description: z.string()
        .min(10, "Course description must be at least 10 characters")
        .max(5000, "Course description cannot exceed 5000 characters")
        .trim(),

    department: z.string().max(100).optional(),

    level: z.enum(["undergraduate", "graduate", "doctoral", "certificate", "professional"]).optional(),

    credits: z.number()
        .int("Credits must be a whole number")
        .min(1, "Credits must be at least 1")
        .max(20, "Credits cannot exceed 20")
        .default(3),

    maxStudents: z.number()
        .int("Max students must be a whole number")
        .min(1, "Must allow at least 1 student")
        .max(1000, "Cannot exceed 1000 students")
        .optional(),

    minStudents: z.number()
        .int("Min students must be a whole number")
        .min(1, "Must require at least 1 student")
        .max(100, "Min students cannot exceed 100")
        .default(1),

    // Enhanced metadata
    objectives: z.array(z.string().max(500)).max(20).default([]),
    outcomes: z.array(z.string().max(500)).max(20).default([]),
    prerequisites: z.array(z.string().max(100)).max(10).default([]),
    keywords: z.array(z.string().max(50)).max(20).default([]),

    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).default("BEGINNER"),
    estimatedHours: z.number().min(1).max(1000).optional(),

    // Scheduling validation
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    semester: z.string().max(20).optional(),
    year: z.number().int().min(2020).max(2050).optional(),

    facultyId: z.string().cuid("Invalid faculty ID"),
    instructorId: z.string().cuid("Invalid instructor ID"),
})
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return new Date(data.startDate) < new Date(data.endDate);
            }
            return true;
        },
        {
            message: "End date must be after start date",
            path: ["endDate"]
        }
    )
    .refine(
        (data) => {
            if (data.maxStudents && data.minStudents) {
                return data.maxStudents >= data.minStudents;
            }
            return true;
        },
        {
            message: "Max students must be greater than or equal to min students",
            path: ["maxStudents"]
        }
    );

// Enhanced invitation schema with comprehensive validation
export const invitationSchema = z.object({
    email: z.string()
        .email("Invalid email address")
        .max(254, "Email address too long"),

    firstName: z.string()
        .min(1, "First name is required")
        .max(50, "First name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
        .optional(),

    lastName: z.string()
        .min(1, "Last name is required")
        .max(50, "Last name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
        .optional(),

    role: z.enum(["STUDENT", "PROFESSOR", "FACULTY_ADMIN", "SCHOOL_ADMIN", "ORGANIZATION_ADMIN"]),

    type: z.enum(["ORGANIZATION_MEMBER", "PROFESSOR_APPOINTMENT", "FACULTY_ASSIGNMENT"]),

    message: z.string()
        .max(1000, "Message cannot exceed 1000 characters")
        .optional(),

    // Professor-specific fields
    proposedTitle: z.string()
        .max(100, "Proposed title cannot exceed 100 characters")
        .optional(),

    department: z.string()
        .max(100, "Department name cannot exceed 100 characters")
        .optional(),

    contractType: z.enum(["Full-time", "Part-time", "Visiting", "Adjunct", "Guest"])
        .optional(),

    startDate: z.string().datetime().optional(),

    facultyId: z.string().cuid("Invalid faculty ID").optional(),
    schoolId: z.string().cuid("Invalid school ID").optional(),
    organizationId: z.string().cuid("Invalid organization ID"),

    // Expiration validation (default 30 days, max 365 days)
    expiresAt: z.string().datetime()
        .refine(
            (date) => {
                const expiry = new Date(date);
                const now = new Date();
                const maxExpiry = new Date();
                maxExpiry.setDate(maxExpiry.getDate() + 365);

                return expiry > now && expiry <= maxExpiry;
            },
            {
                message: "Expiration date must be between now and 1 year from now"
            }
        )
});

// Course approval decision schema
export const approvalDecisionSchema = z.object({
    decision: z.enum(["approve", "reject", "request_revision"]),

    comments: z.string()
        .max(2000, "Comments cannot exceed 2000 characters")
        .optional(),

    internalNotes: z.string()
        .max(1000, "Internal notes cannot exceed 1000 characters")
        .optional(),

    // Enhanced scoring
    contentScore: z.number().min(1).max(10).optional(),
    academicRigor: z.number().min(1).max(10).optional(),
    resourceScore: z.number().min(1).max(10).optional(),
    innovationScore: z.number().min(1).max(10).optional(),

    // Feedback
    requiredChanges: z.array(z.string().max(500)).max(20).default([]),
    suggestedChanges: z.array(z.string().max(500)).max(20).default([]),

    revisionDeadline: z.string().datetime().optional(),

    // Review metadata
    conflictOfInterest: z.boolean().default(false),
    reviewMethodology: z.string().max(500).optional(),
    estimatedReviewTime: z.number().min(1).max(168).optional(),
})
    .refine(
        (data) => {
            // If requesting revision, require at least one change or comment
            if (data.decision === "request_revision") {
                return data.requiredChanges.length > 0 || data.comments;
            }
            return true;
        },
        {
            message: "When requesting revision, you must provide required changes or comments",
            path: ["requiredChanges"]
        }
    )
    .refine(
        (data) => {
            // If rejecting, require comments
            if (data.decision === "reject") {
                return data.comments && data.comments.trim().length > 0;
            }
            return true;
        },
        {
            message: "Comments are required when rejecting a course",
            path: ["comments"]
        }
    );

// Query parameter validation
export const courseApprovalQuerySchema = z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "NEEDS_REVISION"]).default("PENDING"),
    level: z.coerce.string().regex(/^[1-3]$/).optional(),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
    page: z.coerce.string().regex(/^\d+$/),
    limit: z.coerce.string().regex(/^\d+$/).max(100),
});

// Soft delete validation
export const softDeleteSchema = z.object({
    reason: z.string()
        .min(5, "Deletion reason must be at least 5 characters")
        .max(500, "Deletion reason cannot exceed 500 characters"),
});