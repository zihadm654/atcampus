import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventsTab from '@/app/(profile)/[username]/_components/tabs/EventsTab';

describe('EventsTab', () => {
  const mockEvents = [
    {
      id: 'event1',
      name: 'Tech Conference 2023',
      description: 'Annual technology conference'
    },
    {
      id: 'event2',
      name: 'Career Fair',
      description: 'Meet potential employers'
    }
  ];

  const mockUser = {
    id: 'user1',
    role: 'INSTITUTION',
    events: mockEvents
  };

  const mockPermissions = {
    canEdit: true,
    canViewPrivate: true
  };

  it('renders correctly with events data', () => {
    render(
      <EventsTab
        user={mockUser}
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if the main title is rendered
    expect(screen.getByText('Events')).toBeInTheDocument();

    // Check if event information is rendered
    expect(screen.getByText('Tech Conference 2023')).toBeInTheDocument();
    expect(screen.getByText('Annual technology conference')).toBeInTheDocument();

    expect(screen.getByText('Career Fair')).toBeInTheDocument();
    expect(screen.getByText('Meet potential employers')).toBeInTheDocument();

    // Check if "Create Event" button is rendered
    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });

  it('renders access restricted message when user cannot view', () => {
    render(
      <EventsTab
        user={mockUser}
        loggedInUserId="user2"
        permissions={{ canEdit: false, canViewPrivate: false }}
      />
    );

    // Check if access restricted message is rendered
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(screen.getByText(/don't have permission to view the events/i)).toBeInTheDocument();
  });

  it('renders no events message when user has no events', () => {
    const userWithoutEvents = { ...mockUser, events: [] };

    render(
      <EventsTab
        user={userWithoutEvents}
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if no events message is rendered
    expect(screen.getByText('No Events Found')).toBeInTheDocument();
    expect(screen.getByText(/doesn't have any events yet/i)).toBeInTheDocument();

    // Check if "Create First Event" button is rendered
    expect(screen.getByText('Create First Event')).toBeInTheDocument();
  });

  it('does not render create buttons when user cannot edit', () => {
    render(
      <EventsTab
        user={mockUser}
        loggedInUserId="user2"
        permissions={{ canEdit: false, canViewPrivate: true }}
      />
    );

    // Check that "Create Event" button is not rendered
    expect(screen.queryByText('Create Event')).not.toBeInTheDocument();
  });
});