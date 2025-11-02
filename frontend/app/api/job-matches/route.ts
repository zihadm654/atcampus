import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateJobMatch } from "@/lib/job-matching";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only students should have skill matches
    if (user.role !== "STUDENT") {
      return new NextResponse("Only students can have skill matches", {
        status: 403,
      });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return new NextResponse("Job ID is required", { status: 400 });
    }

    // Calculate match in real-time
    const match = await calculateJobMatch(user.id, jobId);

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error calculating job match:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function _calculateMatch(studentId: string, jobId: string) {
  try {
    // Get job details (skills and courses)
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        jobCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    // Get student skills
    const studentSkills = await prisma.userSkill.findMany({
      where: {
        userId: studentId,
      },
      include: {
        skill: true,
      },
    });

    // Get student courses (enrollments)
    const studentEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        status: "ENROLLED", // Only consider enrolled courses
      },
      include: {
        course: true,
      },
    });

    // Calculate skill match
    const requiredSkills = job.skills.length;
    const matchedSkills = studentSkills.filter((studentSkill) =>
      job.skills.some(
        (skillName) =>
          skillName.toLowerCase() === studentSkill.skill.name.toLowerCase()
      )
    ).length;

    const skillMatchPercentage =
      requiredSkills > 0 ? (matchedSkills / requiredSkills) * 100 : 0;

    // Calculate course match
    const requiredCourses = job.jobCourses.length;
    const matchedCourses = studentEnrollments.filter((enrollment) =>
      job.jobCourses.some(
        (jobCourse) => jobCourse.courseId === enrollment.courseId
      )
    ).length;

    const courseMatchPercentage =
      requiredCourses > 0 ? (matchedCourses / requiredCourses) * 100 : 0;

    // Calculate overall match percentage (weighted average: 70% skills, 30% courses)
    const matchPercentage =
      skillMatchPercentage * 0.7 + courseMatchPercentage * 0.3;

    return {
      skillMatchPercentage,
      courseMatchPercentage,
      matchPercentage,
      requiredSkills,
      matchedSkills,
      requiredCourses,
      matchedCourses,
    };
  } catch (error) {
    console.error("Error calculating job match:", error);
    throw error;
  }
}
