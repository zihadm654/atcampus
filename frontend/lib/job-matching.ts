import { cache } from "react";
import { prisma } from "./prisma";

export interface JobMatchResult {
  skillMatchPercentage: number;
  courseMatchPercentage: number;
  matchPercentage: number;
  requiredSkills: number;
  matchedSkills: number;
  requiredCourses: number;
  matchedCourses: number;
  missingSkills: string[];
  missingCourses: string[];
}

// Cache the job matching calculation for 5 minutes
const cachedCalculateJobMatch = cache(
  async (studentId: string, jobId: string): Promise<JobMatchResult> => {
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
            skillName.toLowerCase() === studentSkill.skill.name.toLowerCase(),
        ),
      ).length;

      const skillMatchPercentage =
        requiredSkills > 0 ? (matchedSkills / requiredSkills) * 100 : 0;

      // Get missing skills
      const matchedSkillNames = studentSkills.map((skill) =>
        skill.skill.name.toLowerCase(),
      );
      const missingSkills = job.skills.filter(
        (skillName) => !matchedSkillNames.includes(skillName.toLowerCase()),
      );

      // Calculate course match
      const requiredCourses = job.jobCourses.length;
      const matchedCourses = studentEnrollments.filter((enrollment) =>
        job.jobCourses.some(
          (jobCourse) => jobCourse.courseId === enrollment.courseId,
        ),
      ).length;

      const courseMatchPercentage =
        requiredCourses > 0 ? (matchedCourses / requiredCourses) * 100 : 0;

      // Get missing courses
      const matchedCourseIds = studentEnrollments.map(
        (enrollment) => enrollment.courseId,
      );
      const missingCourses = job.jobCourses
        .filter((jobCourse) => !matchedCourseIds.includes(jobCourse.courseId))
        .map((jobCourse) => jobCourse.course.title);

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
        missingSkills,
        missingCourses,
      };
    } catch (error) {
      console.error("Error calculating job match:", error);
      throw error;
    }
  },
);

export async function calculateJobMatch(
  studentId: string,
  jobId: string,
): Promise<JobMatchResult> {
  // Use React's cache function for server-side caching
  return cachedCalculateJobMatch(studentId, jobId);
}
