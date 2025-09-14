import React from "react";
import { Fragment } from "react";
import { Users, Building, Briefcase } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  ProfileUserData,
  ProfilePermissions,
  Member,
  Job,
} from "@/types/profile-types";
import { UserData } from "@/types/types";

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
  jobs,
  permissions,
  isOwnProfile,
}: OrganizationOverviewProps) {
  // Get unique members count
  const uniqueMembers = members
    ? Array.from(new Set(members.map((m) => m.userId)))
    : [];

  return (
    <Fragment>
      <div className="grid grid-cols-1 gap-4">
        {/* Organization Info */}
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center text-lg font-medium">
              <Building className="size-5 mr-2" />
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
                <p className="text-sm text-gray-500">
                  {uniqueMembers.length} members
                </p>
              </div>

              {members && members.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center">
                    <Users className="size-4 mr-2" />
                    Members
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {members.slice(0, 5).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{member.user.name}</p>
                          <p className="text-sm text-gray-500">
                            {member.role} {member.title && `• ${member.title}`}
                          </p>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    ))}
                    {members.length > 5 && (
                      <p className="text-sm text-gray-500 text-center pt-2">
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
            <CardTitle className="flex items-center text-lg font-medium">
              <Briefcase className="size-5 mr-2" />
              Job Postings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="size-12 mx-auto mb-3" />
              <p>Job postings will be displayed here</p>
              {permissions.canEdit && isOwnProfile && (
                <p className="text-sm mt-2">Post jobs to attract talent</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Fragment>
  );
}
