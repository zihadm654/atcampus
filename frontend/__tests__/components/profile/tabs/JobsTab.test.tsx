import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JobsTab from '@/app/(profile)/[username]/_components/tabs/JobsTab';

// Mock the JobComponent since it has complex dependencies
vi.mock('@/components/jobs/Job', () => ({
  default: ({ job }: { job: any }) => (
    <div data-testid="job-component">
      <h3>{job.title}</h3>
    </div>
  )
}));

// Mock the Icons component
vi.mock('@/components/shared/icons', () => ({
  Icons: {
    job: ({ className }: { className: string }) => <div data-testid="job-icon" className={className} />,
    chevronRight: ({ className }: { className: string }) => <div data-testid="chevron-icon" className={className} />,
    add: ({ className }: { className: string }) => <div data-testid="add-icon" className={className} />
  }
}));

describe('JobsTab', () => {
  const mockJobs = [
    {
      id: '1',
      job: {
        id: 'job1',
        title: 'Software Engineer',
        user: { id: 'user1' }
      }
    },
    {
      id: '2',
      job: {
        id: 'job2',
        title: 'Frontend Developer',
        user: { id: 'user1' }
      }
    }
  ];

  const mockPermissions = {
    canEdit: true,
    canViewPrivate: false
  };

  it('renders correctly with jobs', () => {
    render(
      <JobsTab
        jobs={mockJobs}
        userRole="STUDENT"
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if the main container is rendered
    expect(screen.getByText('Job & Activities')).toBeInTheDocument();
    
    // Check if job components are rendered
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    
    // Check if the correct number of job components are rendered
    const jobComponents = screen.getAllByTestId('job-component');
    expect(jobComponents).toHaveLength(2);
  });

  it('renders empty state when no jobs', () => {
    render(
      <JobsTab
        jobs={[]}
        userRole="STUDENT"
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if empty state is rendered
    expect(screen.getByText('No job or activities added yet')).toBeInTheDocument();
    
    // Check if "Add Experience" button is rendered when user can edit
    expect(screen.getByText('Add Experience')).toBeInTheDocument();
  });

  it('does not render "Add Experience" button when user cannot edit', () => {
    render(
      <JobsTab
        jobs={[]}
        userRole="STUDENT"
        loggedInUserId="user2" // Different user ID
        permissions={{ canEdit: false, canViewPrivate: false }}
      />
    );

    // Check if empty state is rendered
    expect(screen.getByText('No job or activities added yet')).toBeInTheDocument();
    
    // Check if "Add Experience" button is NOT rendered when user cannot edit
    expect(screen.queryByText('Add Experience')).not.toBeInTheDocument();
  });

  it('renders correct number of jobs when limited', () => {
    const manyJobs = Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 1}`,
      job: {
        id: `job${i + 1}`,
        title: `Job ${i + 1}`,
        user: { id: 'user1' }
      }
    }));

    render(
      <JobsTab
        jobs={manyJobs}
        userRole="STUDENT"
        loggedInUserId="user1"
        permissions={mockPermissions}
      />
    );

    // Check if all job components are rendered
    const jobComponents = screen.getAllByTestId('job-component');
    expect(jobComponents).toHaveLength(5);
  });
});