import { cache } from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import {
  getCourseEnrollments,
  getProfessorCourses,
  getResearchProjects,
  getJobApplications,
  getCreatedJobs,
  getInstitutionCourses,
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
    },
  });

  if (!user) notFound();
  return user;
});

const getJobs = cache(async (user: UserData) => {
  if (user.role === "ORGANIZATION") {
    // For organizations, fetch created jobs
    const createdJobs = await getCreatedJobs(user.id, 10);
    return createdJobs;
  } else {
    // For students, fetch applied jobs
    const applications = await getJobApplications(user.id, 10);
    // Extract jobs from applications for student view
    return applications.map((app: any) => app.job);
  }
});

const getCourses = cache(async (user: UserData) => {
  switch (user.role) {
    case "PROFESSOR":
      const professorCourses = await getProfessorCourses(user.id, 10);
      return professorCourses;
    case "INSTITUTION":
      const institutionCourses = await getInstitutionCourses(user.id, 10);
      return institutionCourses;
    case "ADMIN":
      // For admin, we might want to show all courses or filter by some criteria
      // For now, let's get all courses with limit
      const adminCourses = await prisma.course.findMany({
        include: {
          faculty: {
            include: {
              school: true,
            },
          },
          instructor: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        take: 10,
        orderBy: {
          createdAt: Prisma.SortOrder.desc,
        },
      });
      return adminCourses;
    default:
      // For STUDENT and other roles, get enrolled courses
      const enrolled = await getCourseEnrollments(user.id, 10);
      return enrolled;
  }
});

const getResearches = cache(async (userId: string) => {
  const researches = await getResearchProjects(userId, 10);
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
  const jobs = await getJobs(user);
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
      <div className="w-full min-w-0 space-y-5 container mx-auto">
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