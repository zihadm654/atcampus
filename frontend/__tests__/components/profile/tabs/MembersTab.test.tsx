import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MembersTab from '@/app/(profile)/[username]/_components/tabs/MembersTab';

describe('MembersTab', () => {
  const mockMembers = [
    {
      id: 'member1',
      userId: 'user1',
      organizationId: 'org1',
      facultyId: 'faculty1',
      role: 'ADMIN',
      user: {
        id: 'user1',
        name: 'John Admin',
        username: 'john_admin',
        email: 'john@admin.com'
      },
      organization: {
        id: 'org1',
        name: 'Test University'
      },
      faculty: {
        id: 'faculty1',
        name: 'Computer Science'
      }
    },
    {
      id: 'member2',
      userId: 'user2',
      organizationId: 'org1',
      role: 'MEMBER',
      user: {
        id: 'user2',
        name: 'Jane Member',
        username: 'jane_member',
        email: 'jane@member.com'
      },
      organization: {
        id: 'org1',
        name: 'Another University'
      }
    }
  ];

  const mockUser = {
    id: 'user1',
    role: 'INSTITUTION',
    members: mockMembers
  };

  const mockPermissions = {
    canEdit: true,
    canViewPrivate: true
  };

  it('renders correctly with members data', () => {
    render(
      <MembersTab
        user={mockUser}
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if the main title is rendered
    expect(screen.getByText('Organization Members')).toBeInTheDocument();

    // Check if member information is rendered
    expect(screen.getByText('Test University')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument(); // Role transformed from ADMIN
    expect(screen.getByText('Computer Science')).toBeInTheDocument();

    expect(screen.getByText('Another University')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument(); // Role transformed from MEMBER

    
  });

  it('renders access restricted message when user cannot view', () => {
    render(
      <MembersTab
        user={mockUser}
        loggedInUserId="user2"
        permissions={{ canEdit: false, canViewPrivate: false }}
      />
    );

    // Check if access restricted message is rendered
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.getByText(/don't have permission to view the members/i)).toBeInTheDocument();
  });

  it('renders no memberships message when user has no members', () => {
    const userWithoutMembers = { ...mockUser, members: [] };

    render(
      <MembersTab
        user={userWithoutMembers}
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if no memberships message is rendered
    expect(screen.getByText('No organization memberships')).toBeInTheDocument();
  });
});