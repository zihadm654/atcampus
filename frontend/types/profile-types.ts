import type { Prisma } from '@prisma/client';
import type { UserRole } from '@/lib/validations/auth';

// Enhanced profile data types according to the design specification

export interface ProfilePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canManageAcademic: boolean;
  canAssignProfessors: boolean;
  canCreateSchools: boolean;
  canCreateFaculties: boolean;
  canCreateCourses: boolean;
  canViewPrivate: boolean;
}

export interface ExtendedSchool {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverPhoto?: string;
  website?: string;
  isActive: boolean;
  organizationId: string;
  faculties: ExtendedFaculty[];
  _count: {
    faculties: number;
    courses: number;
  };
}

export interface ExtendedFaculty {
  shortName: any;
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverPhoto?: string;
  website?: string;
  isActive: boolean;
  schoolId: string;
  professors: Professor[];
  courses: Course[];
  members: Member[];
  _count: {
    professors: number;
    courses: number;
    students: number;
  };
}

export interface Professor {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
    email: string;
  };
  title?: string;
  department?: string;
  office?: string;
  website?: string;
  researchInterests: string[];
  facultyId?: string;
  faculty?: {
    id: string;
    name: string;
  };
}

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  facultyId?: string;
  role: string;
  title?: string;
  department?: string;
  office?: string;
  website?: string;
  researchInterests: string[];
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
  };
  faculty?: {
    id: string;
    name: string;
  };
}


export interface Course {
  id: string;
  title: string;
  code: string;
  description?: string;
  credits?: number;
  semester?: string;
  year?: number;
  isActive: boolean;
  facultyId: string;
  instructorId?: string;
  faculty: {
    id: string;
    name: string;
  };
  instructor?: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
  _count: {
    enrollments: number;
  };
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  grade?: string;
  enrolledAt: Date;
  course: Course;
}

export enum EnrollmentStatus {
  PENDING = "PENDING",
  ENROLLED = "ENROLLED",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED",
  FAILED = "FAILED"
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company?: string;
  location?: string;
  type: JobType;
  salary?: string;
  requirements: string[];
  benefits: string[];
  isActive: boolean;
  deadline?: Date;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
  _count: {
    applications: number;
  };
}

export enum JobType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  INTERNSHIP = "INTERNSHIP",
  CONTRACT = "CONTRACT",
  FREELANCE = "FREELANCE",
  VOLUNTEER = "VOLUNTEER"
}

export interface Research {
  id: string;
  title: string;
  description: string;
  abstract?: string;
  keywords: string[];
  status: ResearchStatus;
  isPublic: boolean;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
  collaborators: {
    id: string;
    name: string;
    username: string;
    image?: string;
  }[];
  _count: {
    collaborators: number;
  };
}

export enum ResearchStatus {
  DRAFT = "DRAFT",
  IN_PROGRESS = "IN_PROGRESS",
  UNDER_REVIEW = "UNDER_REVIEW",
  PUBLISHED = "PUBLISHED",
  COMPLETED = "COMPLETED"
}

export interface ProfileUserData {
  id: string;
  username: string;
  displayUsername: string;
  name: string;
  bio?: string;
  role: UserRole;
  institution?: string;
  instituteId?: string;
  status: UserStatus;
  currentSemester?: string;
  image?: string;
  coverImage?: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  userSkills: UserSkill[];
  members: Member[];
  schools: ExtendedSchool[];
  courses: Course[];
  enrollments: Enrollment[];
  jobs: Job[];
  research: Research[];
  _count: {
    posts: number;
    research: number;
    followers: number;
  };
}

export interface UserSkill {
  id: string;
  title: string;
  level: SkillLevel;
  yearsOfExperience?: number;
  skillId: string;
  skill?: {
    category?: string;
  };
  _count?: {
    endorsements: number;
  };
}

export enum SkillLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT"
}

export enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED"
}

export interface ProfileData {
  user: ProfileUserData;
  permissions: ProfilePermissions;
}

// Tab configuration interface
export interface TabConfig {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: keyof ProfilePermissions;
  roles: UserRole[];
  disabled?: boolean;
}

// Prisma select queries for profile data
export function getProfileUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayUsername: true,
    name: true,
    bio: true,
    role: true,
    institution: true,
    instituteId: true,
    status: true,
    currentSemester: true,
    image: true,
    coverImage: true,
    email: true,
    emailVerified: true,
    createdAt: true,
    userSkills: {
      include: {
        skill: {
          select: {
            category: true,
          },
        },
        _count: {
          select: {
            endorsements: true,
          },
        },
      },
    },
    members: {
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            email: true,
          },
        },
      },
    },
    _count: {
      select: {
        posts: true,
        research: true,
        followers: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type ProfileUserSelectData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getProfileUserDataSelect>;
}>;