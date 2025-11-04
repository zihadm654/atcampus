import { Prisma } from "@prisma/client";
import type { LiteralStringForUnion, UR } from "stream-chat";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
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
    displayUsername: true,
    createdAt: true,
    userSkills: {
      where: {
        isDeleted: false, // Only fetch non-deleted skills
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            category: true,
            difficulty: true,
            yearsOfExperience: true,
          },
        },
        _count: {
          select: {
            endorsements: true,
          },
        },
      },

      take: 10, // Limit for performance
    },
    applications: true,
    schools: {
      include: {
        faculties: {
          include: {
            courses: {
              include: {
                instructor: true,
                _count: {
                  select: {
                    enrollments: true,
                  },
                },
              },
              orderBy: {
                createdAt: Prisma.SortOrder.desc,
              },
              take: 5, // Limit courses per faculty for initial load
            },
            _count: {
              select: {
                courses: true,
                members: true,
              },
            },
          },
          orderBy: {
            name: Prisma.SortOrder.asc,
          },
        },
      },
    },
    members: true,
    posts: true,
    research: true,
    events: true,
    clubs: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        posts: true,
        research: true,
        followers: true,
        following: true
      },
    },
  } satisfies Prisma.UserSelect;
}

export function getUserSkillDataSelect() {
  return {
    id: true,
    skillId: true,
    skill: {
      select: {
        name: true,
        category: true,
        difficulty: true,
        yearsOfExperience: true,
      },
    },
    _count: {
      select: {
        endorsements: true,
      },
    },
  } satisfies Prisma.UserSkillSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;
export type UserSkillData = Prisma.UserSkillGetPayload<{
  select: ReturnType<typeof getUserSkillDataSelect>;
}>;

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

export function getJobDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    savedJobs: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    jobCourses: true,
    applications: {
      // Add this new field
      where: {
        applicantId: loggedInUserId,
      },
      select: {
        applicantId: true,
      },
    },
    _count: {
      select: {
        applications: true,
      },
    },
  } satisfies Prisma.JobInclude;
}

export function getCourseDataInclude(loggedInUserId: string) {
  return {
    instructor: {
      select: getUserDataSelect(loggedInUserId),
    },
    instructorCourses: true,
    faculty: {
      include: {
        school: {
          include: {
            institution: true,
          },
        },
      },
    },
    enrollments: {
      include: {
        course: true,
      },
    },
    _count: {
      select: {
        enrollments: true,
      },
    },
  } satisfies Prisma.CourseInclude;
}

export function getResearchDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true,
    savedResearch: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    collaborationRequests: {
      include: {
        requester: {
          select: getUserDataSelect(loggedInUserId),
        },
      },
    },
    collaborators: {
      select: getUserDataSelect(loggedInUserId),
    },
    _count: {
      select: {
        collaborators: true,
      },
    },
  } satisfies Prisma.ResearchInclude;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;
export type JobData = Prisma.JobGetPayload<{
  include: ReturnType<typeof getJobDataInclude>;
}>;
export type CourseData = Prisma.CourseGetPayload<{
  include: ReturnType<typeof getCourseDataInclude>;
}>;
export type ResearchData = Prisma.ResearchGetPayload<{
  include: ReturnType<typeof getResearchDataInclude>;
}>;
export type SkillData = Prisma.UserSkillGetPayload<{
  include: ReturnType<typeof getSkillDataInclude>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}
export interface JobsPage {
  jobs: JobData[];
  nextCursor: string | null;
}
export interface CoursesPage {
  courses: CourseData[];
  nextCursor: string | null;
}
export interface ResearchesPage {
  researches: ResearchData[];
  nextCursor: string | null;
}
export interface SkillPage {
  skills: SkillData[];
  previousCursor: string | null;
}

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.CommentInclude;
}

export function getSkillDataInclude() {
  return {
    skill: {
      select: {
        name: true,
        category: true,
        difficulty: true,
        yearsOfExperience: true,
      },
    },
    _count: {
      select: {
        endorsements: true,
      },
    },
  } satisfies Prisma.UserSkillInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayUsername: true,
      image: true,
    },
  },
  post: {
    select: {
      content: true,
    },
  },
  job: {
    select: {
      id: true,
      title: true,
    },
  },
  course: {
    select: {
      id: true,
      title: true,
      code: true,
      enrollments: true,
    },
  },
  research: {
    select: {
      title: true,
    },
  },
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export interface SaveJobInfo {
  isSaveJobByUser: boolean;
}

export interface ApplyJobInfo {
  isAppliedByUser: boolean;
}

export interface SaveResearchInfo {
  isSaveResearchByUser: boolean;
}

export interface NotificationCountInfo {
  unreadCount: number;
}

export interface MessageCountInfo {
  unreadCount: number;
}

export type AttachmentType = {};
export type ChannelType = { demo?: string };
export type CommandType = LiteralStringForUnion;
export type EventType = {};
export type MemberType = UR;
export type MessageType = {};
export type ReactionType = {};
export type UserType = { image?: string };

export type StreamChatGenerics = {
  attachmentType: AttachmentType;
  channelType: ChannelType;
  commandType: CommandType;
  eventType: EventType;
  memberType: MemberType;
  messageType: MessageType;
  reactionType: ReactionType;
  userType: UserType;
  pollOptionType: Record<string, unknown>;
  pollType: Record<string, unknown>;
};
