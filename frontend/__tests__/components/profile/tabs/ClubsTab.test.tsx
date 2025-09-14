import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ClubsTab from '@/app/(profile)/[username]/_components/tabs/ClubsTab';

describe('ClubsTab', () => {
  const mockClubs = [
    {
      id: 'club1',
      name: 'Computer Science Club',
      description: 'For students interested in computer science'
    },
    {
      id: 'club2',
      name: 'Robotics Club',
      description: 'Building and programming robots'
    }
  ];

  const mockUser = {
    id: 'user1',
    role: 'INSTITUTION',
    clubs: mockClubs
  };

  const mockPermissions = {
    canEdit: true,
    canViewPrivate: true
  };

  it('renders correctly with clubs data', () => {
    render(
      <ClubsTab
        user={mockUser}
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if the main title is rendered
    expect(screen.getByText('Clubs')).toBeInTheDocument();

    // Check if club information is rendered
    expect(screen.getByText('Computer Science Club')).toBeInTheDocument();
    expect(screen.getByText('For students interested in computer science')).toBeInTheDocument();

    expect(screen.getByText('Robotics Club')).toBeInTheDocument();
    expect(screen.getByText('Building and programming robots')).toBeInTheDocument();

    // Check if "Create Club" button is rendered
    expect(screen.getByText('Create Club')).toBeInTheDocument();
  });

  it('renders access restricted message when user cannot view', () => {
    render(
      <ClubsTab
        user={mockUser}
        loggedInUserId="user2"
        permissions={{ canEdit: false, canViewPrivate: false }}
      />
    );

    // Check if access restricted message is rendered
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.getByText(/don't have permission to view the clubs/i)).toBeInTheDocument();
  });

  it('renders no clubs message when user has no clubs', () => {
    const userWithoutClubs = { ...mockUser, clubs: [] };

    render(
      <ClubsTab
        user={userWithoutClubs}
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if no clubs message is rendered
    expect(screen.getByText('No Clubs Found')).toBeInTheDocument();
    expect(screen.getByText(/doesn't have any clubs yet/i)).toBeInTheDocument();

    // Check if "Create First Club" button is rendered
    expect(screen.getByText('Create First Club')).toBeInTheDocument();
  });

  it('does not render create buttons when user cannot edit', () => {
    render(
      <ClubsTab
        user={mockUser}
        loggedInUserId="user2"
        permissions={{ canEdit: false, canViewPrivate: true }}
      />
    );

    // Check that "Create Club" button is not rendered
    expect(screen.queryByText('Create Club')).not.toBeInTheDocument();
  });
});