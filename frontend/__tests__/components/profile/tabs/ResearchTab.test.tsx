import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResearchTab from '@/app/(profile)/[username]/_components/tabs/ResearchTab';

// Mock the ResearchComponent since it has complex dependencies
vi.mock('@/components/researches/Research', () => ({
  default: ({ research }: { research: any }) => (
    <div data-testid="research-component">
      <h3>{research.title}</h3>
    </div>
  )
}));

// Mock the Icons component
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    bookMarked: ({ className }: { className: string }) => <div data-testid="research-icon" className={className} />,
    chevronRight: ({ className }: { className: string }) => <div data-testid="chevron-icon" className={className} />,
    add: ({ className }: { className: string }) => <div data-testid="add-icon" className={className} />
  }
}));

describe('ResearchTab', () => {
  const mockResearches = [
    {
      id: '1',
      title: 'Machine Learning Research',
      userId: 'user1'
    },
    {
      id: '2',
      title: 'Quantum Computing Study',
      userId: 'user1'
    }
  ];

  const mockPermissions = {
    canEdit: true,
    canViewPrivate: false
  };

  it('renders correctly with researches when user owns the profile', () => {
    render(
      <ResearchTab
        researches={mockResearches}
        userRole="STUDENT"
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if the main container is rendered
    expect(screen.getByText('Research')).toBeInTheDocument();
    
    // Check if research components are rendered
    expect(screen.getByText('Machine Learning Research')).toBeInTheDocument();
    expect(screen.getByText('Quantum Computing Study')).toBeInTheDocument();
    
    // Check if the correct number of research components are rendered
    const researchComponents = screen.getAllByTestId('research-component');
    expect(researchComponents).toHaveLength(2);
  });

  it('renders empty state when no researches', () => {
    render(
      <ResearchTab
        researches={[]}
        userRole="STUDENT"
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if empty state is rendered
    expect(screen.getByText('No research added yet')).toBeInTheDocument();
    
    // Check if "Add research" button is rendered when user can edit
    expect(screen.getByText('Add Research')).toBeInTheDocument();
  });

  it('does not render "Add research" button when user cannot edit', () => {
    render(
      <ResearchTab
        researches={[]}
        userRole="STUDENT"
        loggedInUserId="user2" // Different user ID
        permissions={{ canEdit: false, canViewPrivate: false }}
      />
    );

    // Check if empty state is rendered
    expect(screen.getByText('No research added yet')).toBeInTheDocument();
    
    // Check if "Add research" button is NOT rendered when user cannot edit
    expect(screen.queryByText('Add Research')).not.toBeInTheDocument();
  });

  it('renders empty state when user does not own the profile', () => {
    render(
      <ResearchTab
        researches={mockResearches}
        userRole="STUDENT"
        loggedInUserId="user2" // Different user ID
        permissions={{ canEdit: false, canViewPrivate: false }}
      />
    );

    // Check if empty state is rendered
    expect(screen.getByText('No research added yet')).toBeInTheDocument();
    
    // Check if "Add research" button is NOT rendered when user does not own the profile
    expect(screen.queryByText('Add Research')).not.toBeInTheDocument();
  });
});