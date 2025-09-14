import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingsTabProps {
  user: any;
  loggedInUserId: string;
  permissions: any;
  loading?: boolean;
}

export default function SettingsTab({ user, loggedInUserId, permissions, loading = false }: SettingsTabProps) {
  const canEdit = loggedInUserId && permissions.canEdit;

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icons.laptop className="size-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Access Restricted</h3>
        <p className="text-gray-500 text-center max-w-md">
          You don't have permission to view or edit settings for this profile.
        </p>
      </div>
    );
  }

  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icons.settings className="size-6" />
        <h2 className="text-2xl font-bold">Institution Settings</h2>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Institution Name</label>
              <p className="text-gray-900 mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <p className="text-gray-900 mt-1">@{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900 mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <p className="text-gray-900 mt-1">{user.bio || 'No bio available'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Academic Year Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Academic Year</p>
                <p className="text-sm text-gray-600">Set the current academic year for course scheduling</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Semester System</p>
                <p className="text-sm text-gray-600">Configure semester or quarter system</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Course Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Course Approval Workflow</p>
                <p className="text-sm text-gray-600">Configure approval levels for new courses</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enrollment Settings</p>
                <p className="text-sm text-gray-600">Set enrollment periods and limits</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Permissions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User Roles & Permissions</p>
                <p className="text-sm text-gray-600">Manage roles and their permissions</p>
              </div>
              <Button variant="outline">Manage</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Faculty Management</p>
                <p className="text-sm text-gray-600">Configure faculty creation and management</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}