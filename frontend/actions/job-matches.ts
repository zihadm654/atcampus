"use server";

import { prisma } from "@/lib/db";
import { calculateJobMatch } from "@/lib/job-matching";
import { getCurrentUser } from "@/lib/session";

export async function getJobMatch(jobId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Only students should have skill matches
    if (user.role !== "STUDENT") {
      return { error: "Only students can have skill matches" };
    }

    if (!jobId) {
      return { error: "Job ID is required" };
    }

    // Calculate match in real-time
    const match = await calculateJobMatch(user.id, jobId);

    return { success: true, match };
  } catch (error) {
    console.error("Error calculating job match:", error);
    return { error: "Internal Server Error" };
  }
}

// Function to update course skills when creating/updating a course
export async function updateCourseSkills(courseId: string, skillIds: string[]) {
  try {
    // Delete existing course skills
    await prisma.courseSkill.deleteMany({
      where: {
        courseId,
      },
    });

    // Create new course skills
    if (skillIds.length > 0) {
      await prisma.courseSkill.createMany({
        data: skillIds.map((skillId) => ({
          courseId,
          skillId,
        })),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating course skills:", error);
    return { error: "Failed to update course skills" };
  }
}
