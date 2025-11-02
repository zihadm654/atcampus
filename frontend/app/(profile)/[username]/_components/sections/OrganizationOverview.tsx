import { Briefcase, Building, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Job, ProfilePermissions } from "@/types/profile-types";
import type { UserData } from "@/types/types";

interface OrganizationOverviewProps {
  user: UserData;
  members: any[];
  jobs: Job[];
  permissions: ProfilePermissions;
  isOwnProfile: boolean;
}

export default function OrganizationOverview({
  user,
  members,
  permissions,
  isOwnProfile,
}: OrganizationOverviewProps) {
  // Get unique members count
  const uniqueMembers = members
    ? Array.from(new Set(members.map((m) => m.userId)))
    : [];

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Organization Info */}
      <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center font-medium text-lg">
            <Building className="mr-2 size-5" />
            Organization Overview
          </CardTitle>
          {permissions.canEdit && (
            <Badge variant="secondary">Organization Admin</Badge>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-gray-500 text-sm">
                {uniqueMembers.length} members
              </p>
            </div>

            {members && members.length > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center font-medium">
                  <Users className="mr-2 size-4" />
                  Members
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {members.slice(0, 5).map((member) => (
                    <div
                      className="flex items-center justify-between rounded-lg border p-3"
                      key={member.id}
                    >
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-gray-500 text-sm">
                          {member.role} {member.title && `• ${member.title}`}
                        </p>
                      </div>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                  ))}
                  {members.length > 5 && (
                    <p className="pt-2 text-center text-gray-500 text-sm">
                      + {members.length - 5} more members
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Jobs Overview */}
      <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center font-medium text-lg">
            <Briefcase className="mr-2 size-5" />
            Job Postings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="py-8 text-center text-gray-500">
            <Briefcase className="mx-auto mb-3 size-12" />
            <p>Job postings will be displayed here</p>
            {permissions.canEdit && isOwnProfile && (
              <p className="mt-2 text-sm">Post jobs to attract talent</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
