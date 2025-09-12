import { prisma } from '@/lib/db';
import { MemberRole, UserRole } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface InstitutionalHierarchy {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    website?: string;
    isActive: boolean;
  };
  schools: Array<{
    id: string;
    name: string;
    shortName?: string;
    slug: string;
    description?: string;
    logo?: string;
    coverPhoto?: string;
    website?: string;
    isActive: boolean;
    faculties: Array<{
      id: string;
      name: string;
      shortName?: string;
      slug: string;
      description?: string;
      logo?: string;
      coverPhoto?: string;
      website?: string;
      isActive: boolean;
      professorCount: number;
      courseCount: number;
    }>;
  }>;
}

export interface FacultyAssignment {
  userId: string;
  organizationId: string;
  facultyId: string;
  role: MemberRole;
  isActive: boolean;
}

// ============================================================================
// HIERARCHY FETCHING FUNCTIONS
// ============================================================================

/**
 * Fetches the complete institutional hierarchy for a given organization
 * Requirements: 1.1, 1.5
 */
export async function getInstitutionalHierarchy(
  organizationId: string
): Promise<InstitutionalHierarchy | null> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        schools: {
          where: { isActive: true },
          include: {
            faculties: {
              where: { isActive: true },
              include: {
                _count: {
                  select: {
                    members: true,
                    courses: {
                      where: { isActive: true },
                    },
                  },
                },
              },
              orderBy: { name: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!organization) {
      return null;
    }

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo || undefined,
        description: organization.description || undefined,
        website: organization.website || undefined,
        isActive: organization.isActive,
      },
      schools: organization.schools.map((school) => ({
        id: school.id,
        name: school.name,
        shortName: school.shortName || undefined,
        slug: school.slug,
        description: school.description || undefined,
        logo: school.logo || undefined,
        coverPhoto: school.coverPhoto || undefined,
        website: school.website || undefined,
        isActive: school.isActive,
        faculties: school.faculties.map((faculty) => ({
          id: faculty.id,
          name: faculty.name,
          shortName: faculty.shortName || undefined,
          slug: faculty.slug,
          description: faculty.description || undefined,
          logo: faculty.logo || undefined,
          coverPhoto: faculty.coverPhoto || undefined,
          website: faculty.website || undefined,
          isActive: faculty.isActive,
          professorCount: faculty._count.members,
          courseCount: faculty._count.courses,
        })),
      })),
    };
  } catch (error) {
    console.error('Error fetching institutional hierarchy:', error);
    throw new Error('Failed to fetch institutional hierarchy');
  }
}

/**
 * Fetches all schools within an organization
 * Requirements: 1.1, 1.3
 */
export async function getOrganizationSchools(organizationId: string) {
  try {
    return await prisma.school.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            faculties: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching organization schools:', error);
    throw new Error('Failed to fetch organization schools');
  }
}

/**
 * Fetches all faculties within a school
 * Requirements: 1.1, 1.3
 */
export async function getSchoolFaculties(schoolId: string) {
  try {
    return await prisma.faculty.findMany({
      where: {
        schoolId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            members: true,
            courses: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching school faculties:', error);
    throw new Error('Failed to fetch school faculties');
  }
}

/**
 * Fetches faculty details with professors and courses
 * Requirements: 1.1, 1.5
 */
export async function getFacultyDetails(facultyId: string) {
  try {
    return await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        school: {
          include: {
            organization: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        courses: {
          where: { isActive: true },
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                enrollments: {
                  where: { status: 'ENROLLED' },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching faculty details:', error);
    throw new Error('Failed to fetch faculty details');
  }
}

// ============================================================================
// PERMISSION VALIDATION UTILITIES
// ============================================================================

/**
 * Validates if a user has institutional access to an organization
 * Requirements: 7.1, 7.2
 */
export async function validateInstitutionalAccess(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const member = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      include: {
        user: {
          select: {
            role: true,
            status: true,
          },
        },
      },
    });

    if (!member || !member.isActive) {
      return false;
    }

    // Check if user has institutional role
    const hasInstitutionalRole =
      member.user.role === UserRole.INSTITUTION ||
      member.role === MemberRole.ORGANIZATION_ADMIN ||
      member.role === MemberRole.SCHOOL_ADMIN ||
      member.role === MemberRole.FACULTY_ADMIN ||
      member.role === MemberRole.SUPER_ADMIN;

    // Check if user account is active
    const isUserActive = member.user.status === 'ACTIVE';

    return hasInstitutionalRole && isUserActive;
  } catch (error) {
    console.error('Error validating institutional access:', error);
    return false;
  }
}

/**
 * Validates if a user can manage a specific school
 * Requirements: 7.1, 7.2
 */
export async function validateSchoolManagementAccess(
  userId: string,
  schoolId: string
): Promise<boolean> {
  try {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { organizationId: true },
    });

    if (!school) {
      return false;
    }

    const member = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: school.organizationId,
        },
      },
      include: {
        user: {
          select: {
            role: true,
            status: true,
          },
        },
      },
    });

    if (!member || !member.isActive || member.user.status !== 'ACTIVE') {
      return false;
    }

    // Organization admin and super admin can manage all schools
    // School admin can manage their specific school (would need additional logic for specific school assignment)
    return (
      member.user.role === UserRole.INSTITUTION ||
      member.role === MemberRole.ORGANIZATION_ADMIN ||
      member.role === MemberRole.SCHOOL_ADMIN ||
      member.role === MemberRole.SUPER_ADMIN
    );
  } catch (error) {
    console.error('Error validating school management access:', error);
    return false;
  }
}

/**
 * Validates if a user can manage a specific faculty
 * Requirements: 7.1, 7.2
 */
export async function validateFacultyManagementAccess(
  userId: string,
  facultyId: string
): Promise<boolean> {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        school: {
          select: { organizationId: true },
        },
      },
    });

    if (!faculty) {
      return false;
    }

    const member = await prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: faculty.school.organizationId,
        },
      },
      include: {
        user: {
          select: {
            role: true,
            status: true,
          },
        },
      },
    });

    if (!member || !member.isActive || member.user.status !== 'ACTIVE') {
      return false;
    }

    // Check if user has faculty management permissions
    const canManageFaculty =
      member.user.role === UserRole.INSTITUTION ||
      member.role === MemberRole.ORGANIZATION_ADMIN ||
      member.role === MemberRole.SCHOOL_ADMIN ||
      member.role === MemberRole.FACULTY_ADMIN ||
      member.role === MemberRole.SUPER_ADMIN;

    // Additional check: if user is faculty admin, they should be assigned to this faculty
    if (member.role === MemberRole.FACULTY_ADMIN) {
      return member.facultyId === facultyId;
    }

    return canManageFaculty;
  } catch (error) {
    console.error('Error validating faculty management access:', error);
    return false;
  }
}

// ============================================================================
// FACULTY ASSIGNMENT VERIFICATION HELPERS
// ============================================================================

/**
 * Verifies if a professor is assigned to a specific faculty
 * Requirements: 1.3, 7.1
 */
export async function verifyProfessorFacultyAssignment(
  userId: string,
  facultyId: string
): Promise<boolean> {
  try {
    const assignment = await prisma.member.findFirst({
      where: {
        userId,
        facultyId,
        role: MemberRole.PROFESSOR,
        isActive: true,
      },
      include: {
        user: {
          select: {
            status: true,
          },
        },
      },
    });

    return assignment !== null && assignment.user.status === 'ACTIVE';
  } catch (error) {
    console.error('Error verifying professor faculty assignment:', error);
    return false;
  }
}

/**
 * Gets all faculty assignments for a professor
 * Requirements: 1.3, 2.3
 */
export async function getProfessorFacultyAssignments(
  userId: string
): Promise<FacultyAssignment[]> {
  try {
    const assignments = await prisma.member.findMany({
      where: {
        userId,
        role: MemberRole.PROFESSOR,
        isActive: true,
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            school: {
              select: {
                name: true,
                organization: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return assignments.map((assignment) => ({
      userId: assignment.userId,
      organizationId: assignment.organizationId,
      facultyId: assignment.facultyId!,
      role: assignment.role as MemberRole, // Cast string to MemberRole enum
      isActive: assignment.isActive,
    }));
  } catch (error) {
    console.error('Error getting professor faculty assignments:', error);
    throw new Error('Failed to get professor faculty assignments');
  }
}

/**
 * Checks if a professor can be assigned to a faculty (prevents duplicates)
 * Requirements: 2.4
 */
export async function canAssignProfessorToFaculty(
  userId: string,
  facultyId: string
): Promise<{ canAssign: boolean; reason?: string }> {
  try {
    // Check if professor is already assigned to this faculty
    const existingAssignment = await prisma.member.findFirst({
      where: {
        userId,
        facultyId,
        role: MemberRole.PROFESSOR,
      },
    });

    if (existingAssignment) {
      return {
        canAssign: false,
        reason: 'Professor is already assigned to this faculty',
      };
    }

    // Check if user exists and has appropriate role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        status: true,
      },
    });

    if (!user) {
      return {
        canAssign: false,
        reason: 'User not found',
      };
    }

    if (user.role !== UserRole.PROFESSOR) {
      return {
        canAssign: false,
        reason: 'User does not have professor role',
      };
    }

    if (user.status !== 'ACTIVE') {
      return {
        canAssign: false,
        reason: 'User account is not active',
      };
    }

    // Check if faculty exists and is active
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      select: {
        isActive: true,
        school: {
          select: {
            isActive: true,
            organization: {
              select: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!faculty) {
      return {
        canAssign: false,
        reason: 'Faculty not found',
      };
    }

    if (
      !faculty.isActive ||
      !faculty.school.isActive ||
      !faculty.school.organization.isActive
    ) {
      return {
        canAssign: false,
        reason: 'Faculty, school, or organization is not active',
      };
    }

    return { canAssign: true };
  } catch (error) {
    console.error(
      'Error checking professor faculty assignment eligibility:',
      error
    );
    return {
      canAssign: false,
      reason: 'Error checking assignment eligibility',
    };
  }
}

/**
 * Gets the organizational context for a faculty (faculty → school → organization)
 * Requirements: 1.1, 1.5
 */
export async function getFacultyOrganizationalContext(facultyId: string) {
  try {
    return await prisma.faculty.findUnique({
      where: { id: facultyId },
      select: {
        id: true,
        name: true,
        slug: true,
        school: {
          select: {
            id: true,
            name: true,
            slug: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error getting faculty organizational context:', error);
    throw new Error('Failed to get faculty organizational context');
  }
}
