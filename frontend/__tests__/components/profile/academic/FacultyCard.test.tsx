import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FacultyCard from '@/app/(profile)/[username]/_components/academic/FacultyCard';

describe('FacultyCard', () => {
  const mockFaculty = {
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
  };

  const mockHandlers = {
    onToggle: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onAddCourse: vi.fn(),
    onEditCourse: vi.fn(),
    onDeleteCourse: vi.fn(),
    onViewCourseDetails: vi.fn()
  };

  it('renders correctly with faculty data', () => {
    render(
      <FacultyCard
        faculty={mockFaculty}
        expanded={false}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check if faculty information is rendered
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Computer Science Department')).toBeInTheDocument();

    // Check if statistics badges are rendered
    expect(screen.getByText('2 Courses')).toBeInTheDocument();
    expect(screen.getByText('10 Members')).toBeInTheDocument();

    // Check if faculty avatar is rendered with correct initial
    expect(screen.getByText('C')).toBeInTheDocument(); // First letter of "Computer"

    // Check if Add Course button is rendered when user can edit
    expect(screen.getByText('Add Course')).toBeInTheDocument();
  });

  it('renders no courses message when there are no courses', () => {
    const facultyWithoutCourses = {
      ...mockFaculty,
      courses: []
    };

    render(
      <FacultyCard
        faculty={facultyWithoutCourses}
        expanded={true}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check if no courses message is rendered
    expect(screen.getByText('No courses in this faculty yet')).toBeInTheDocument();
    expect(screen.getByText('Add Course')).toBeInTheDocument();
  });

  it('does not render Add Course button when user cannot edit', () => {
    render(
      <FacultyCard
        faculty={mockFaculty}
        expanded={false}
        canEdit={false}
        {...mockHandlers}
      />
    );

    // Check that Add Course button is not rendered
    expect(screen.queryByText('Add Course')).not.toBeInTheDocument();
  });

  it('renders course items when expanded', () => {
    render(
      <FacultyCard
        faculty={mockFaculty}
        expanded={true}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check if course information is rendered
    expect(screen.getByText('Intro to Programming')).toBeInTheDocument();
    expect(screen.getByText('CS101')).toBeInTheDocument();
    expect(screen.getByText('Data Structures')).toBeInTheDocument();
    expect(screen.getByText('CS201')).toBeInTheDocument();
  });
});