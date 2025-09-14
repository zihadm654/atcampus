import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AcademicStructure from '@/app/(profile)/[username]/_components/academic/AcademicStructure';

describe('AcademicStructure', () => {
  const mockOrganizationData = [
    {
      id: 'org1',
      name: 'Test University',
      schools: [
        {
          id: 'school1',
          name: 'Engineering School',
          description: 'School of Engineering',
          faculties: [
            {
              id: 'faculty1',
              name: 'Computer Science',
              description: 'Computer Science Department',
              courses: [
                { 
                  id: 'course1', 
                  title: 'Intro to Programming', 
                  code: 'CS101',
                  credits: 3,
                  status: 'ACTIVE',
                  instructor: { id: 'inst1', name: 'Dr. Smith' },
                  _count: { enrollments: 25 }
                },
                { 
                  id: 'course2', 
                  title: 'Data Structures', 
                  code: 'CS201',
                  credits: 3,
                  status: 'ACTIVE',
                  instructor: { id: 'inst1', name: 'Dr. Smith' },
                  _count: { enrollments: 20 }
                }
              ],
              _count: { courses: 2, members: 10 }
            }
          ],
          _count: { faculties: 1 }
        }
      ],
      _count: { schools: 1, members: 50 }
    }
  ];

  const mockHandlers = {
    onEditSchool: vi.fn(),
    onDeleteSchool: vi.fn(),
    onDeleteFaculty: vi.fn(),
    onAddSchool: vi.fn(),
    onAddFaculty: vi.fn(),
    onEditFaculty: vi.fn(),
    onAddCourse: vi.fn(),
    onEditCourse: vi.fn(),
    onDeleteCourse: vi.fn(),
    onViewCourseDetails: vi.fn()
  };

  it('renders correctly with organization data', () => {
    render(
      <AcademicStructure
        organizationData={mockOrganizationData}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check if the main title is rendered
    expect(screen.getByText('Schools & Academic Structure')).toBeInTheDocument();

    // Check if school information is rendered
    expect(screen.getByText('Engineering School')).toBeInTheDocument();
    expect(screen.getByText('School of Engineering')).toBeInTheDocument();

    // Check if statistics are rendered correctly
    expect(screen.getByText('1 Schools')).toBeInTheDocument();
    expect(screen.getByText('1 Faculties')).toBeInTheDocument();
    expect(screen.getByText('2 Courses')).toBeInTheDocument();
    expect(screen.getByText('50 Members')).toBeInTheDocument();

    // Check if statistics cards are rendered with correct values
    expect(screen.getByText('1')).toBeInTheDocument(); // Total Schools
    expect(screen.getByText('1')).toBeInTheDocument(); // Total Faculties
    expect(screen.getByText('2')).toBeInTheDocument(); // Total Courses
    expect(screen.getByText('50')).toBeInTheDocument(); // Total Members

    // Check if academic structure overview is rendered
    expect(screen.getByText('Engineering School')).toBeInTheDocument();
    expect(screen.getByText('1 Faculties')).toBeInTheDocument();
    expect(screen.getByText('2 Courses')).toBeInTheDocument();

    // Check if Add School button is rendered when user can edit
    expect(screen.getByText('Add School')).toBeInTheDocument();
  });

  it('renders no schools message when there are no schools', () => {
    const emptyOrganizationData = [
      {
        id: 'org1',
        name: 'Test University',
        schools: [],
        _count: { schools: 0, members: 0 }
      }
    ];

    render(
      <AcademicStructure
        organizationData={emptyOrganizationData}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check if no schools message is rendered
    expect(screen.getByText('No Schools Found')).toBeInTheDocument();
    expect(screen.getByText(/doesn't have any schools yet/i)).toBeInTheDocument();
    expect(screen.getByText('Add First School')).toBeInTheDocument();
  });

  it('does not render Add School button when user cannot edit', () => {
    render(
      <AcademicStructure
        organizationData={mockOrganizationData}
        canEdit={false}
        {...mockHandlers}
      />
    );

    // Check that Add School button is not rendered
    expect(screen.queryByText('Add School')).not.toBeInTheDocument();
  });
});