import { prisma } from "@/lib/db";
import { getUserDataSelect } from "@/types/types";
import { Prisma, EnrollmentStatus } from "@prisma/client";

// Optimized queries for the new profile architecture

// Base user selection for profile header
// export const getProfileUserSelect = (loggedInUserId: string) => ({
//   id: true,
//   name: true,
//   username: true,
//   email: true,
//   bio: true,
//   image: true,
//   coverImage: true,
//   institution: true,
//   instituteId: true,
//   currentSemester: true,
//   role: true,
//   createdAt: true,
//   _count: {
//     select: {
//       posts: true,
//       followers: true,
//       following: true,
//     },
//   },
//   followers: {
//     where: {
//       followerId: loggedInUserId,
//     },
//     select: {
//       followerId: true,
//     },
//   },
//   userSkills: {
//     include: {
//       skill: {
//         select: {
//           name: true,
//           category: true,
//         },
//       },
//       _count: {
//         select: {
//           endorsements: true,
//         },
//       },
//     },
//     orderBy: {
//       yearsOfExperience: Prisma.SortOrder.desc,
//     },
//     take: 10, // Limit for performance
//   },
//   schools: {
//     include: {
//       faculties: true,
//     },
//   },
//   members: {
//     include: {
//       // organization: {
//       //   include: {
//       //     members: true,
//       //   },
//       // },
//       faculty: true,
//     },
//   },
//   clubs: true,
//   events: true,
// });

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
    in: [EnrollmentStatus.PENDING, EnrollmentStatus.ENROLLED, EnrollmentStatus.COMPLETED],
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
      faculty: true
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
          userId: userId,
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
    }
  })
  return user
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

export async function getResearchProjects(userId: string, limit = 10) {
  const research = await prisma.research.findMany({
    where: {
      userId: userId,
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

// Database optimization utilities
export function buildOptimizedProfileQuery(username: string, loggedInUserId: string) {
  return {
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  };
}

// Query performance monitoring
export function logQueryPerformance(queryName: string, startTime: number) {
  const endTime = Date.now();
  const duration = endTime - startTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`Query ${queryName} took ${duration}ms`);
  }

  // In production, you could send this to a monitoring service
  return duration;
}