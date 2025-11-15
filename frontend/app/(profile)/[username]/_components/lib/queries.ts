import { EnrollmentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getUserDataSelect } from "@/types/types";

// Optimized academic structure query
export const getAcademicStructureInclude = () => ({
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
      _count: {
        select: {
          faculties: true,
        },
      },
    },
    orderBy: {
      name: Prisma.SortOrder.asc,
    },
  },
  _count: {
    select: {
      schools: true,
      members: true,
    },
  },
});

// Optimized course enrollment query
export const getCourseEnrollmentsWhere = (userId: string) => ({
  studentId: userId,
  status: {
    in: [
      EnrollmentStatus.PENDING,
      EnrollmentStatus.ENROLLED,
      EnrollmentStatus.COMPLETED,
    ],
  },
});

export const getCourseEnrollmentsInclude = () => ({
  course: {
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      credits: true,
      status: true,
      startDate: true,
      endDate: true,
      instructor: true,
      faculty: true,
    },
  },
});

// Optimized job applications query
export const getJobApplicationsInclude = (userId: string) => ({
  job: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
      },
      savedJobs: {
        where: {
          userId,
        },
        select: {
          userId: true,
        },
      },
      applications: {
        where: {
          applicantId: userId,
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
    },
  },
});

// Optimized research query
export const getResearchInclude = (loggedInUserId: string) => ({
  user: {
    select: getUserDataSelect(loggedInUserId),
  },
  savedResearch: {
    where: {
      userId: loggedInUserId,
    },
    select: {
      userId: true,
    },
  },
  collaborators: {
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  },
  collaborationRequests: {
    where: {
      requesterId: loggedInUserId,
    },
    select: {
      id: true,
    },
  },
  _count: {
    select: {
      collaborators: true,
    },
  },
});

// Performance optimized helper functions
export async function getProfileData(username: string, loggedInUserId: string) {
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
  return user;
}
// export type UserProfileData = Prisma.UserGetPayload<{
//   select: ReturnType<typeOf getProfileData >;
// }>;
export async function getAcademicStructure(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: getAcademicStructureInclude(),
  });

  return organization;
}

export async function getCourseEnrollments(userId: string, limit = 10) {
  return prisma.enrollment.findMany({
    where: getCourseEnrollmentsWhere(userId),
    include: getCourseEnrollmentsInclude(),
    take: limit,
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
  });
}

export async function getProfessorCourses(userId: string, limit = 10) {
  return prisma.course.findMany({
    where: {
      instructorId: userId,
    },
    include: {
      faculty: true,
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
    take: limit,
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
  });
}

// Function to get courses created by an institution
export async function getInstitutionCourses(institutionId: string, limit = 10) {
  return prisma.course.findMany({
    where: {
      faculty: {
        school: {
          institutionId,
        },
      },
    },
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
    take: limit,
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
  });
}

// Optimized job applications query
export async function getJobApplications(userId: string, limit = 10) {
  const applications = await prisma.application.findMany({
    where: {
      applicantId: userId,
    },
    include: getJobApplicationsInclude(userId),
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
    take: limit,
  });

  return applications;
}

// Function to get jobs created by a user/organization
export async function getCreatedJobs(userId: string, limit = 10) {
  const jobs = await prisma.job.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
      },
      savedJobs: {
        where: {
          userId,
        },
        select: {
          userId: true,
        },
      },
      applications: {
        select: {
          applicantId: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
    take: limit,
  });

  return jobs;
}

export async function getResearchProjects(userId: string, limit = 10) {
  const research = await prisma.research.findMany({
    where: {
      userId,
    },
    include: getResearchInclude(userId),
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
    take: limit,
  });

  return research;
}

// Lazy loading helpers for progressive data fetching
export async function getSchoolDetails(schoolId: string) {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      faculties: {
        include: {
          courses: {
            include: {
              instructor: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  enrollments: true,
                },
              },
            },
          },
          _count: {
            select: {
              courses: true,
              members: true,
            },
          },
        },
      },
      _count: {
        select: {
          faculties: true,
        },
      },
    },
  });

  return school;
}

export async function getFacultyDetails(facultyId: string) {
  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
    include: {
      courses: {
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: {
          createdAt: Prisma.SortOrder.desc,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          courses: true,
          members: true,
        },
      },
    },
  });

  return faculty;
}
