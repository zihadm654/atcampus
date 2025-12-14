import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
	type FollowerInfo,
	getUserDataSelect,
	type UserData,
} from "@/types/types";
import { ProfileProvider } from "./_components/context/ProfileContext";
import {
	getCourseEnrollments,
	getCreatedJobs,
	getInstitutionCourses,
	getJobApplications,
	getProfessorCourses,
	getResearchProjects,
} from "./_components/lib/queries";
import ProfileHeader from "./_components/ProfileHeader";
import ProfileTabs from "./_components/ProfileTabs";

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
	}
	// For students, fetch applied jobs
	const applications = await getJobApplications(user.id, 10);
	// Extract jobs from applications for student view
	return applications.map((app: any) => app.job);
});

const getCourses = cache(async (user: UserData) => {
	switch (user.role) {
		case "PROFESSOR": {
			const professorCourses = await getProfessorCourses(user.id, 10);
			return professorCourses;
		}
		case "INSTITUTION": {
			const institutionCourses = await getInstitutionCourses(user.id, 10);
			return institutionCourses;
		}
		case "ADMIN": {
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
			});
			return adminCourses;
		}
		default: {
			// For STUDENT and other roles, get enrolled courses
			const enrollments = await getCourseEnrollments(user.id, 10);
			// Transform enrollment data to extract course information
			const enrolledCourses = enrollments.map(
				(enrollment) => enrollment.course,
			);
			return enrolledCourses;
		}
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
		description: `${user.username}'s profile page`,
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
			({ followerId }) => followerId === loggedInUser.id,
		),
	};

	return (
		<ProfileProvider initialUser={user} loggedInUserId={loggedInUser.id}>
			<div className="container mx-auto w-full min-w-0 space-y-5 max-md:p-2">
				<ProfileHeader
					followerInfo={followerInfo}
					isOwnProfile={user.id === loggedInUser.id}
					loggedInUserId={loggedInUser.id}
					user={user}
				/>
				<Suspense fallback={<div>Loading...</div>}>
					<ProfileTabs
						courses={courses}
						jobs={jobs}
						loggedInUserId={loggedInUser.id}
						loggedInUserRole={loggedInUser.role}
						researches={researches}
						user={user}
					/>
				</Suspense>
			</div>
		</ProfileProvider>
	);
}
