import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnalyticsTab from '@/app/(profile)/[username]/_components/tabs/AnalyticsTab';

describe('AnalyticsTab', () => {
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
                { id: 'course1', title: 'Intro to Programming', code: 'CS101' },
                { id: 'course2', title: 'Data Structures', code: 'CS201' }
              ],
              _count: { courses: 2, members: 10 }
            },
            {
              id: 'faculty2',
              name: 'Electrical Engineering',
              description: 'Electrical Engineering Department',
              courses: [
                { id: 'course3', title: 'Circuit Analysis', code: 'EE101' }
              ],
              _count: { courses: 1, members: 8 }
            }
          ],
          _count: { faculties: 2 }
        },
        {
          id: 'school2',
          name: 'Business School',
          description: 'School of Business',
          faculties: [
            {
              id: 'faculty3',
              name: 'Marketing',
              description: 'Marketing Department',
              courses: [
                { id: 'course4', title: 'Marketing Principles', code: 'MKT101' },
                { id: 'course5', title: 'Consumer Behavior', code: 'MKT201' },
                { id: 'course6', title: 'Digital Marketing', code: 'MKT301' }
              ],
              _count: { courses: 3, members: 12 }
            }
          ],
          _count: { faculties: 1 }
        }
      ],
      _count: { schools: 2, members: 100 }
    }
  ];

  const mockUser = {
    id: 'user1',
    role: 'INSTITUTION'
  };

  const mockPermissions = {
    canEdit: true,
    canViewPrivate: true
  };

  it('renders correctly with organization data', () => {
    render(
      <AnalyticsTab
        organizationData={mockOrganizationData}
        user={mockUser}
        permissions={mockPermissions}
      />
    );

    // Check if the main title is rendered
    expect(screen.getByText('Institution Analytics')).toBeInTheDocument();

    // Check if statistics cards are rendered with correct values
    expect(screen.getByText('2')).toBeInTheDocument(); // Total Schools (2 schools)
    expect(screen.getByText('3')).toBeInTheDocument(); // Total Faculties (2 + 1)
    expect(screen.getByText('6')).toBeInTheDocument(); // Total Courses (2 + 1 + 3)
    expect(screen.getByText('100')).toBeInTheDocument(); // Total Members

    // Check if academic structure overview is rendered
    expect(screen.getByText('Engineering School')).toBeInTheDocument();
    expect(screen.getByText('Business School')).toBeInTheDocument();

    // Check faculty and course counts in overview
    // Use getAllByText since there are multiple elements with the same text
    expect(screen.getAllByText('2 Faculties')).toHaveLength(1); // Engineering School
    expect(screen.getAllByText('3 Courses')).toHaveLength(2); // Both schools have 3 courses
    expect(screen.getAllByText('1 Faculties')).toHaveLength(1); // Business School
  });

  it('renders access restricted message when user cannot view', () => {
    render(
      <AnalyticsTab
        organizationData={mockOrganizationData}
        user={mockUser}
        permissions={{ canEdit: false, canViewPrivate: false }}
      />
    );

    // Check if access restricted message is rendered
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.getByText(/don't have permission to view analytics/i)).toBeInTheDocument();
  });

  it('renders correctly with empty organization data', () => {
    render(
      <AnalyticsTab
        organizationData={[]}
        user={mockUser}
        permissions={mockPermissions}
      />
    );

    // Check if no data message is rendered
    expect(screen.getByText('No data available for analytics')).toBeInTheDocument();
  });
});