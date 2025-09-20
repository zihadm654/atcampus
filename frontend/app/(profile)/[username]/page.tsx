import { cache } from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  getCourseEnrollments,
  getProfessorCourses,
  logQueryPerformance,
} from "./_components/lib/queries";
import {
  FollowerInfo,
  getJobDataInclude,
  getResearchDataInclude,
  getUserDataSelect,
  UserData,
} from "@/types/types";
import { getCurrentUser } from "@/lib/session";

import ProfileHeader from "./_components/ProfileHeader";
import ProfileTabs from "./_components/ProfileTabs";
import { ProfileProvider } from "./_components/context/ProfileContext";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ username: string }>;
}

// Optimized data fetching with performance monitoring
const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: {
      ...getUserDataSelect(loggedInUserId),
      members: true,
      userSkills: {
        include: {
          skill: {
            select: {
              name: true,
              category: true,
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
                take: 5, // Limit courses per faculty for initial load
              },
              _count: {
                select: {
                  courses: true,
                  members: true,
                },
              },
            },
          },
        },
      },
      events: true,
      clubs: true,
    },
  });

  if (!user) notFound();
  return user;
});

const getAppliedJobs = cache(async (userId: string) => {
  const startTime = Date.now();
  const applications = await getJobDataInclude(userId);
  logQueryPerformance("getJobApplications", startTime);
  return applications;
});

const getCourses = cache(async (user: UserData) => {
  const startTime = Date.now();
  if (user.role === "PROFESSOR") {
    const courses = await getProfessorCourses(user.id, 10);
    logQueryPerformance("getProfessorCourses", startTime);
    return courses;
  }
  const enrolled = await getCourseEnrollments(user.id, 10);
  logQueryPerformance("getCourseEnrollments", startTime);
  return enrolled;
});

const getResearches = cache(async (userId: string) => {
  const startTime = Date.now();
  const researches = await getResearchDataInclude(userId);
  logQueryPerformance("getResearchProjects", startTime);
  return researches;
});
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) return {};

  const user = await getUser(username, loggedInUser.id);

  return {
    title: `${user.name} (@${user.username})`,
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const user = await getUser(username, loggedInUser.id);
  const jobs = await getAppliedJobs(user.id);
  const researches = await getResearches(user.id);
  const courses = await getCourses(user);
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUser.id
    ),
  };
  return (
    <ProfileProvider initialUser={user} loggedInUserId={loggedInUser.id}>
      <div className="w-full min-w-0 space-y-5">
        <ProfileHeader
          user={user}
          loggedInUserId={loggedInUser.id}
          followerInfo={followerInfo}
          isOwnProfile={user.id === loggedInUser.id}
        />
        <ProfileTabs
          user={user}
          jobs={jobs}
          researches={researches}
          courses={courses}
          loggedInUserId={loggedInUser.id}
          loggedInUserRole={loggedInUser.role}
        />
      </div>
    </ProfileProvider>
  );
}
