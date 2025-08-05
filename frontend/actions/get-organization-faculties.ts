'use server';

import { prisma } from '@/lib/db';

/**
 * Fetches all faculties for a given organization
 * This is used when accepting a professor invitation to select which faculty to join
 */
export async function getOrganizationFaculties(organizationId: string) {
  try {
    // Find all schools for this organization
    const schools = await prisma.school.findMany({
      where: {
        instituteId: organizationId,
      },
      include: {
        faculties: true,
      },
    });

    // Extract all faculties from all schools
    const faculties = schools.flatMap(school => 
      school.faculties.map(faculty => ({
        ...faculty,
        schoolName: school.name,
      }))
    );

    return { success: true, faculties };
  } catch (error) {
    console.error('Error fetching organization faculties:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      faculties: [] 
    };
  }
}