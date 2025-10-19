import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingsTabProps {
  user: any;
  loggedInUserId: string;
  permissions: any;
  loading?: boolean;
}

export default function SettingsTab({
  user,
  loggedInUserId,
  permissions,
  loading = false,
}: SettingsTabProps) {
  const canEdit = loggedInUserId && permissions.canEdit;

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icons.laptop className="mb-4 size-16 text-gray-400" />
        <h3 className="mb-2 font-medium text-gray-700 text-xl">
          Access Restricted
        </h3>
        <p className="max-w-md text-center text-gray-500">
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
            <Card className="p-6" key={i}>
              <Skeleton className="mb-4 h-5 w-32" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((j) => (
                  <div className="space-y-2" key={j}>
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
        <h2 className="font-bold text-2xl">Institution Settings</h2>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-lg">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="font-medium text-gray-700 text-sm">
                Institution Name
              </label>
              <p className="mt-1 text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700 text-sm">
                Username
              </label>
              <p className="mt-1 text-gray-900">@{user.username}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700 text-sm">Email</label>
              <p className="mt-1 text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700 text-sm">Bio</label>
              <p className="mt-1 text-gray-900">
                {user.bio || "No bio available"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-lg">Academic Year Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Academic Year</p>
                <p className="text-gray-600 text-sm">
                  Set the current academic year for course scheduling
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Semester System</p>
                <p className="text-gray-600 text-sm">
                  Configure semester or quarter system
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-lg">Course Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Course Approval Workflow</p>
                <p className="text-gray-600 text-sm">
                  Configure approval levels for new courses
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enrollment Settings</p>
                <p className="text-gray-600 text-sm">
                  Set enrollment periods and limits
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-semibold text-lg">System Permissions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User Roles & Permissions</p>
                <p className="text-gray-600 text-sm">
                  Manage roles and their permissions
                </p>
              </div>
              <Button variant="outline">Manage</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Faculty Management</p>
                <p className="text-gray-600 text-sm">
                  Configure faculty creation and management
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
