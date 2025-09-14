import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SchoolCard from '@/app/(profile)/[username]/_components/academic/SchoolCard';

describe('SchoolCard', () => {
  const mockSchool = {
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
          }
        ],
        _count: { courses: 1, members: 10 }
      }
    ],
    _count: { faculties: 1 }
  };

  const mockHandlers = {
    onToggle: vi.fn(),
    onToggleFaculty: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onDeleteFaculty: vi.fn(),
    onAddFaculty: vi.fn(),
    onEditFaculty: vi.fn(),
    onAddCourse: vi.fn(),
    onEditCourse: vi.fn(),
    onDeleteCourse: vi.fn(),
    onViewCourseDetails: vi.fn()
  };

  const mockExpandedFaculties = new Set<string>();

  it('renders correctly with school data', () => {
    render(
      <SchoolCard
        school={mockSchool}
        expanded={false}
        expandedFaculties={mockExpandedFaculties}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check if school information is rendered
    expect(screen.getByText('Engineering School')).toBeInTheDocument();
    expect(screen.getByText('School of Engineering')).toBeInTheDocument();

    // Check if statistics badges are rendered
    expect(screen.getByText('1 Faculties')).toBeInTheDocument();
    expect(screen.getByText('1 Courses')).toBeInTheDocument();

    // Check if school avatar is rendered with correct initial
    expect(screen.getByText('E')).toBeInTheDocument(); // First letter of "Engineering"

    // Check if Add Faculty button is rendered when user can edit
    expect(screen.getByText('Add Faculty')).toBeInTheDocument();
  });

  it('renders no faculties message when there are no faculties', () => {
    const schoolWithoutFaculties = {
      ...mockSchool,
      faculties: []
    };

    render(
      <SchoolCard
        school={schoolWithoutFaculties}
        expanded={true}
        expandedFaculties={mockExpandedFaculties}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check if no faculties message is rendered
    expect(screen.getByText('No faculties in this school yet')).toBeInTheDocument();
    expect(screen.getByText('Add Faculty')).toBeInTheDocument();
  });

  it('does not render Add Faculty button when user cannot edit', () => {
    render(
      <SchoolCard
        school={mockSchool}
        expanded={false}
        expandedFaculties={mockExpandedFaculties}
        canEdit={false}
        {...mockHandlers}
      />
    );

    // Check that Add Faculty button is not rendered
    expect(screen.queryByText('Add Faculty')).not.toBeInTheDocument();
  });

  it('renders faculty cards when expanded', () => {
    render(
      <SchoolCard
        school={mockSchool}
        expanded={true}
        expandedFaculties={mockExpandedFaculties}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check if faculty information is rendered
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Computer Science Department')).toBeInTheDocument();
  });
});