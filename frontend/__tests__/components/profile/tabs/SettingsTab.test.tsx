import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SettingsTab from '@/app/(profile)/[username]/_components/tabs/SettingsTab';

describe('SettingsTab', () => {
  const mockUser = {
    id: 'user1',
    name: 'Test Institution',
    username: 'test_inst',
    email: 'institution@test.com',
    bio: 'A test educational institution',
    role: 'INSTITUTION'
  };

  const mockPermissions = {
    canEdit: true,
    canViewPrivate: true
  };

  it('renders correctly when user has edit permissions', () => {
    render(
      <SettingsTab
        user={mockUser}
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if the main title is rendered
    expect(screen.getByText('Institution Settings')).toBeInTheDocument();

    // Check if general settings section is rendered
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Test Institution')).toBeInTheDocument();
    expect(screen.getByText('@test_inst')).toBeInTheDocument();
    expect(screen.getByText('institution@test.com')).toBeInTheDocument();
    expect(screen.getByText('A test educational institution')).toBeInTheDocument();

    // Check if other settings sections are rendered
    expect(screen.getByText('Academic Year Settings')).toBeInTheDocument();
    expect(screen.getByText('Course Management')).toBeInTheDocument();
    expect(screen.getByText('System Permissions')).toBeInTheDocument();

    // Check if configure buttons are rendered
    const configureButtons = screen.getAllByText('Configure');
    expect(configureButtons).toHaveLength(5); // 5 configure buttons

    const manageButtons = screen.getAllByText('Manage');
    expect(manageButtons).toHaveLength(1); // 1 manage button
  });

  it('renders access restricted message when user cannot edit', () => {
    render(
      <SettingsTab
        user={mockUser}
        loggedInUserId="user2"
        permissions={{ canEdit: false, canViewPrivate: false }}
      />
    );

    // Check if access restricted message is rendered
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.getByText(/don't have permission to view or edit settings/i)).toBeInTheDocument();
  });

  it('renders user info correctly with missing bio', () => {
    const userWithoutBio = { ...mockUser, bio: undefined };

    render(
      <SettingsTab
        user={userWithoutBio}
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if no bio message is rendered
    expect(screen.getByText('No bio available')).toBeInTheDocument();
  });
});