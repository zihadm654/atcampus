import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SchoolsTab from '@/app/(profile)/[username]/_components/tabs/SchoolsTab';

// Mock the AcademicStructure component since it has complex dependencies
vi.mock('@/app/(profile)/[username]/_components/academic/AcademicStructure', () => ({
  default: ({ organizationData, canEdit }: { organizationData: any, canEdit: boolean }) => (
    <div data-testid="academic-structure">
      <h3>Academic Structure</h3>
      <p>Can Edit: {canEdit ? 'Yes' : 'No'}</p>
      <p>Schools: {organizationData?.[0]?.schools?.length || 0}</p>
    </div>
  )
}));

describe('SchoolsTab', () => {
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
            }
          ],
          _count: { faculties: 1 }
        }
      ],
      _count: { schools: 1, members: 50 }
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
      <SchoolsTab
        organizationData={mockOrganizationData}
        user={mockUser}
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if the academic structure is rendered
    expect(screen.getByTestId('academic-structure')).toBeInTheDocument();
    expect(screen.getByText('Academic Structure')).toBeInTheDocument();
    expect(screen.getByText('Can Edit: Yes')).toBeInTheDocument();
    expect(screen.getByText('Schools: 1')).toBeInTheDocument();
  });

  it('renders access restricted message when user cannot view', () => {
    render(
      <SchoolsTab
        organizationData={mockOrganizationData}
        user={mockUser}
        loggedInUserId="user2"
        permissions={{ canEdit: false, canViewPrivate: false }}
      />
    );

    // Check if access restricted message is rendered
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.getByText(/don't have permission to view the academic structure/i)).toBeInTheDocument();
  });

  it('passes correct canEdit prop to AcademicStructure', () => {
    render(
      <SchoolsTab
        organizationData={mockOrganizationData}
        user={mockUser}
        loggedInUserId="user2"
        permissions={{ canEdit: false, canViewPrivate: true }}
      />
    );

    // Check if canEdit is passed correctly
    expect(screen.getByText('Can Edit: No')).toBeInTheDocument();
  });
});