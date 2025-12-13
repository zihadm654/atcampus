import type { AttendanceStatus, EventStatus, EventType } from "@prisma/client";
import type { ReactNode } from "react";

// Enhanced event data types for comprehensive event management

export interface ExtendedEvent {
  attendees: any;
  likesUsers: boolean;
  capacity: ReactNode;
  isPublic: any;
  id: string;
  name: string;
  description: string;
  type: EventType;
  status: EventStatus;
  location: string;
  venue?: string;
  isOnline: boolean;
  meetingUrl?: string | null;
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date | null;
  maxAttendees: number;
  isRegistrationRequired: boolean;
  requirements?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  coverPhoto?: string | null;
  bannerImage?: string | null;
  isFree: boolean;
  price?: number | null;
  currency: string;
  tags: string[];
  speakers: string[];
  agenda?: string | null;
  isActive: boolean;
  creatorId: string;
  organizationId: string;
  facultyId?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  creator: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
    email: string;
  };
  organization: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
  };
  faculty?: {
    id: string;
    name: string;
  } | null;

  // Counts and stats
  _count: {
    likesUsers: number;
    attendees: number;
    likes: number;
    clubEvents: number;
  };

  // User-specific data
  isLiked?: boolean;
  isAttending?: boolean;
  attendanceStatus?: AttendanceStatus;
  attendeeCount?: number;
  availableSpots?: number;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  registrationNote?: string | null;
  attendedAt?: Date | null;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
    email: string;
  };
  event: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  };
}

export interface EventLike {
  id: string;
  eventId: string;
  userId: string;
  createdAt: Date;

  // Relations
  user: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
  };
  event: {
    id: string;
    name: string;
  };
}

export interface EventWithDetails extends ExtendedEvent {
  attendees: EventAttendee[];
  likes: EventLike[];
  clubEvents: Array<{
    club: {
      id: string;
      name: string;
      type: string;
    };
    isFeatured: boolean;
    displayOrder: number;
  }>;
}

export interface EventFilterOptions {
  type?: EventType;
  status?: EventStatus;
  organizationId?: string;
  facultyId?: string;
  isFree?: boolean;
  isOnline?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalAttendees: number;
  averageAttendance: number;
  popularTypes: Array<{
    type: EventType;
    count: number;
  }>;
  monthlyStats: Array<{
    month: string;
    events: number;
    attendees: number;
  }>;
}

export interface EventParticipationData {
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  registrationNote?: string;
  attendedAt?: Date;
  registeredAt: Date;
}

export interface EventCreationData {
  name: string;
  description: string;
  type: EventType;
  location: string;
  venue?: string;
  isOnline: boolean;
  meetingUrl?: string | null;
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date | null;
  maxAttendees: number;
  isRegistrationRequired: boolean;
  requirements?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  coverPhoto?: string | null;
  bannerImage?: string | null;
  isFree: boolean;
  price?: number | null;
  currency: string;
  tags: string[];
  speakers: string[];
  agenda?: string | null;
  organizationId: string;
  facultyId?: string | null;
}

export interface EventUpdateData extends Partial<EventCreationData> {
  status?: EventStatus;
  isActive?: boolean;
}

// Event notification types
export interface EventNotificationData {
  type:
    | "EVENT_CREATED"
    | "EVENT_UPDATED"
    | "EVENT_CANCELLED"
    | "EVENT_REMINDER"
    | "REGISTRATION_OPEN"
    | "REGISTRATION_CLOSING";
  eventId: string;
  eventName: string;
  eventDate: Date;
  recipientIds: string[];
  message?: string;
}

// Event permissions and access control
export interface EventPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageAttendees: boolean;
  canCreate: boolean;
  canRegister: boolean;
  canCancelRegistration: boolean;
  canLike: boolean;
}

// Event form data types for UI components
export interface EventFormData {
  name: string;
  description: string;
  type: EventType;
  location: string;
  venue: string;
  isOnline: boolean;
  meetingUrl: string;
  startDate: string; // ISO string for form handling
  endDate: string; // ISO string for form handling
  registrationDeadline: string; // ISO string for form handling
  maxAttendees: number;
  isRegistrationRequired: boolean;
  requirements: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  isFree: boolean;
  price: number;
  currency: string;
  tags: string[];
  speakers: string[];
  agenda: string;
  organizationId: string;
  facultyId: string;
  coverPhoto?: File;
  bannerImage?: File;
}

// Event calendar data for calendar views
export interface EventCalendarData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: EventType;
  status: EventStatus;
  location: string;
  isOnline: boolean;
  coverPhoto?: string;
  isRegistrationRequired: boolean;
  maxAttendees: number;
  attendeeCount: number;
  isLiked: boolean;
}

// Event search result type
export interface EventSearchResult {
  events: ExtendedEvent[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Event RSVP and attendance tracking
export interface EventRSVPData {
  eventId: string;
  userId: string;
  status: "ATTENDING" | "NOT_ATTENDING" | "MAYBE";
  guestCount: number;
  dietaryRestrictions?: string;
  specialRequirements?: string;
  registrationNote?: string;
}
