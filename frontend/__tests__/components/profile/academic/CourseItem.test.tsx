import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CourseItem from '@/app/(profile)/[username]/_components/academic/CourseItem';

describe('CourseItem', () => {
  const mockCourse = {
    id: 'course1',
    title: 'Intro to Programming',
    code: 'CS101',
    description: 'Introduction to programming concepts',
    credits: 3,
    status: 'ACTIVE',
    startDate: new Date('2023-09-01'),
    instructor: { id: 'inst1', name: 'Dr. Smith' },
    _count: { enrollments: 25 }
  };

  const mockHandlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onViewDetails: vi.fn()
  };

  it('renders correctly with course data', () => {
    render(
      <CourseItem
        course={mockCourse}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check if course information is rendered
    expect(screen.getByText('Intro to Programming')).toBeInTheDocument();
    expect(screen.getByText('CS101')).toBeInTheDocument();
    expect(screen.getByText('Introduction to programming concepts')).toBeInTheDocument();

    // Check if metadata is rendered
    expect(screen.getByText('Instructor: Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('25 Students')).toBeInTheDocument();
    expect(screen.getByText('3 Credits')).toBeInTheDocument();

    // Check if status badge is rendered with correct styling
    expect(screen.getByText('active')).toBeInTheDocument();

    // Check if date information is rendered
    expect(screen.getByText('Sep 2023')).toBeInTheDocument();
  });

  it('renders correctly with different status', () => {
    const courseWithDifferentStatus = {
      ...mockCourse,
      status: 'INACTIVE'
    };

    render(
      <CourseItem
        course={courseWithDifferentStatus}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check if status badge is rendered with correct styling
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('does not render action buttons when user cannot edit', () => {
    render(
      <CourseItem
        course={mockCourse}
        canEdit={false}
        {...mockHandlers}
      />
    );

    // Check that action buttons are not visible by default
    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit Course')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Course')).not.toBeInTheDocument();
  });

  it('renders course without description', () => {
    const courseWithoutDescription = {
      ...mockCourse,
      description: undefined
    };

    render(
      <CourseItem
        course={courseWithoutDescription}
        canEdit={true}
        {...mockHandlers}
      />
    );

    // Check that the component renders without errors
    expect(screen.getByText('Intro to Programming')).toBeInTheDocument();
    expect(screen.getByText('CS101')).toBeInTheDocument();
  });
});