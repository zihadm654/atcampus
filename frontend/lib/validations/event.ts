import * as z from "zod";

// Event status and type enums
export const eventStatusEnum = z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]);
export const eventTypeEnum = z.enum([
  "ACADEMIC", "SOCIAL", "CAREER", "WORKSHOP", "SEMINAR", "CONFERENCE", 
  "SPORTS", "CULTURAL", "NETWORKING", "VOLUNTEER", "OTHER"
]);

// Base event schema
export const eventSchema = z.object({
  name: z.string().trim().min(1, "Event name is required").max(200, "Event name must be at most 200 characters"),
  description: z
    .string()
    .min(1, "Event description is required")
    .max(5000, "Description must be at most 5000 characters"),
  type: eventTypeEnum,
  status: eventStatusEnum.default("DRAFT"),
  
  // Location and venue
  location: z.string().min(1, "Location is required").max(500, "Location must be at most 500 characters"),
  venue: z.string().max(200, "Venue must be at most 200 characters").optional(),
  isOnline: z.boolean().default(false),
  meetingUrl: z.string().url("Must be a valid URL").optional().nullable(),
  
  // Date and time
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  registrationDeadline: z.date().optional(),
  
  // Capacity and requirements
  maxAttendees: z.coerce.number().int().min(1, "Max attendees must be at least 1").max(10000, "Max attendees must be at most 10000"),
  isRegistrationRequired: z.boolean().default(true),
  requirements: z.string().max(1000, "Requirements must be at most 1000 characters").optional(),
  
  // Contact information
  contactEmail: z.string().email("Must be a valid email address").optional(),
  contactPhone: z.string().max(20, "Phone must be at most 20 characters").optional(),
  websiteUrl: z.string().url("Must be a valid URL").optional().nullable(),
  
  // Media and assets
  coverPhoto: z.string().url("Must be a valid URL").optional().nullable(),
  bannerImage: z.string().url("Must be a valid URL").optional().nullable(),
  
  // Pricing
  isFree: z.boolean().default(true),
  price: z.coerce.number().min(0, "Price must be non-negative").optional(),
  currency: z.string().max(3, "Currency must be at most 3 characters").default("USD"),
  
  // Organization context
  organizationId: z.string().min(1, "Organization is required"),
  facultyId: z.string().optional().nullable(),
  
  // Additional metadata
  tags: z.array(z.string().max(50, "Tag must be at most 50 characters")).max(20, "Maximum 20 tags allowed").optional(),
  speakers: z.array(z.string().max(200, "Speaker name must be at most 200 characters")).max(10, "Maximum 10 speakers allowed").optional(),
  agenda: z.string().max(5000, "Agenda must be at most 5000 characters").optional(),
});

// Create event schema (used for creating new events)
export const createEventSchema = eventSchema.omit({ 
  status: true, // Default to DRAFT
  organizationId: true // Will be set from session
});

// Update event schema (used for updating existing events)
export const updateEventSchema = eventSchema.partial();

// Event participation schemas
export const joinEventSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  userId: z.string().min(1, "User ID is required"),
  registrationNote: z.string().max(500, "Registration note must be at most 500 characters").optional(),
});

export const updateAttendanceSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["ATTENDING", "ATTENDED", "NO_SHOW", "CANCELLED"]),
  notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
});

// Event like schema
export const eventLikeSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

// Event search and filter schema
export const eventFilterSchema = z.object({
  type: eventTypeEnum.optional(),
  status: eventStatusEnum.optional(),
  organizationId: z.string().optional(),
  facultyId: z.string().optional(),
  isFree: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  startDateFrom: z.date().optional(),
  startDateTo: z.date().optional(),
  search: z.string().max(100, "Search must be at most 100 characters").optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Type exports
export type TEvent = z.infer<typeof eventSchema>;
export type TCreateEvent = z.infer<typeof createEventSchema>;
export type TUpdateEvent = z.infer<typeof updateEventSchema>;
export type TJoinEvent = z.infer<typeof joinEventSchema>;
export type TUpdateAttendance = z.infer<typeof updateAttendanceSchema>;
export type TEventLike = z.infer<typeof eventLikeSchema>;
export type TEventFilter = z.infer<typeof eventFilterSchema>;

export type TEventStatus = z.infer<typeof eventStatusEnum>;
export type TEventType = z.infer<typeof eventTypeEnum>;