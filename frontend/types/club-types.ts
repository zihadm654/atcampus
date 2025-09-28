import type { Prisma } from '@prisma/client';
import type { ClubStatus, ClubType, ClubMemberRole } from '@prisma/client';

// Enhanced club data types for comprehensive club management

export interface ExtendedClub {
  clubType: { ACADEMIC: "ACADEMIC"; SPORTS: "SPORTS"; CULTURAL: "CULTURAL"; TECHNICAL: "TECHNICAL"; SOCIAL: "SOCIAL"; HOBBY: "HOBBY"; PROFESSIONAL: "PROFESSIONAL"; OTHER: "OTHER"; };
  id: string;
  name: string;
  description: string;
  type: ClubType;
  status: ClubStatus;
  mission?: string | null;
  vision?: string | null;
  values: string[];
  location?: string | null;
  meetingSchedule?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  socialMedia?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    discord?: string | null;
  } | null;
  isOpenMembership: boolean;
  maxMembers?: number | null;
  membershipRequirements?: string | null;
  approvalRequired: boolean;
  coverPhoto?: string | null;
  logo?: string | null;
  bannerImage?: string | null;
  tags: string[];
  categories: string[];
  foundedYear?: number | null;
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
    members: number;
    likes: number;
    clubEvents: number;
  };

  // User-specific data
  isLiked?: boolean;
  isMember?: boolean;
  memberRole?: ClubMemberRole;
  memberStatus?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  memberCount?: number;
  availableSpots?: number;
}

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: ClubMemberRole;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  applicationMessage?: string | null;
  joinedAt: Date;
  notes?: string | null;
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
  club: {
    id: string;
    name: string;
    type: string;
  };
}

export interface ClubLike {
  id: string;
  clubId: string;
  userId: string;
  createdAt: Date;

  // Relations
  user: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
  };
  club: {
    id: string;
    name: string;
  };
}

export interface ClubEvent {
  id: string;
  clubId: string;
  eventId: string;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;

  // Relations
  club: ExtendedClub;
  event: {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    isOnline: boolean;
    status: string;
  };
}

export interface ClubWithDetails extends ExtendedClub {
  members: ClubMember[];
  likes: ClubLike[];
  clubEvents: ClubEvent[];
  upcomingEvents: Array<{
    id: string;
    name: string;
    startDate: Date;
    location: string;
    isFeatured: boolean;
  }>;
}

export interface ClubFilterOptions {
  type?: ClubType;
  status?: ClubStatus;
  organizationId?: string;
  facultyId?: string;
  isOpenMembership?: boolean;
  search?: string;
  tags?: string[];
  categories?: string[];
  page?: number;
  limit?: number;
}

export interface ClubStats {
  totalClubs: number;
  activeClubs: number;
  totalMembers: number;
  averageMembersPerClub: number;
  popularTypes: Array<{
    type: ClubType;
    count: number;
  }>;
  monthlyStats: Array<{
    month: string;
    newClubs: number;
    newMembers: number;
  }>;
}

export interface ClubMembershipData {
  clubId: string;
  userId: string;
  role: ClubMemberRole;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  applicationMessage?: string;
  joinedAt: Date;
  notes?: string;
}

export interface ClubCreationData {
  name: string;
  description: string;
  type: ClubType;
  mission?: string | null;
  vision?: string | null;
  values: string[];
  location?: string | null;
  meetingSchedule?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  socialMedia?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    discord?: string | null;
  } | null;
  isOpenMembership: boolean;
  maxMembers?: number | null;
  membershipRequirements?: string | null;
  approvalRequired: boolean;
  tags: string[];
  categories: string[];
  foundedYear?: number | null;
  organizationId: string;
  facultyId?: string | null;
}

export interface ClubUpdateData extends Partial<ClubCreationData> {
  status?: ClubStatus;
  isActive?: boolean;
}

// Club notification types
export interface ClubNotificationData {
  type: 'CLUB_CREATED' | 'CLUB_UPDATED' | 'MEMBER_JOINED' | 'MEMBER_LEFT' | 'MEMBER_APPROVED' | 'MEMBER_REJECTED' | 'EVENT_LINKED';
  clubId: string;
  clubName: string;
  recipientIds: string[];
  memberId?: string;
  memberName?: string;
  eventId?: string;
  eventName?: string;
  message?: string;
}

// Club permissions and access control
export interface ClubPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canCreate: boolean;
  canJoin: boolean;
  canLeave: boolean;
  canApproveMembers: boolean;
  canLike: boolean;
  canLinkEvents: boolean;
}

// Club form data types for UI components
export interface ClubFormData {
  name: string;
  description: string;
  type: ClubType;
  mission: string;
  vision: string;
  values: string[];
  location: string;
  meetingSchedule: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    discord: string;
  };
  isOpenMembership: boolean;
  maxMembers: number;
  membershipRequirements: string;
  approvalRequired: boolean;
  tags: string[];
  categories: string[];
  foundedYear: number;
  organizationId: string;
  facultyId: string;
  logo?: File;
  coverPhoto?: File;
  bannerImage?: File;
}

// Club directory and discovery
export interface ClubDirectoryData {
  clubs: ExtendedClub[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
  filters: ClubFilterOptions;
}

// Club member management
export interface ClubMemberApplication {
  id: string;
  clubId: string;
  userId: string;
  role: ClubMemberRole;
  status: 'PENDING';
  applicationMessage?: string;
  appliedAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
    email: string;
  };
}

export interface ClubMemberUpdateData {
  role?: ClubMemberRole;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  notes?: string;
}

// Club event management
export interface ClubEventLinkData {
  eventId: string;
  isFeatured: boolean;
  displayOrder: number;
}

// Club activity and engagement
export interface ClubActivityData {
  clubId: string;
  type: 'MEMBER_JOINED' | 'EVENT_CREATED' | 'EVENT_COMPLETED' | 'DISCUSSION_STARTED';
  timestamp: Date;
  actorId: string;
  actorName: string;
  details?: Record<string, any>;
}

// Club search and discovery
export interface ClubSearchResult {
  clubs: ExtendedClub[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}