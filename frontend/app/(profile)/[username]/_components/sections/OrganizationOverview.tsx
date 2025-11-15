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
      <Card className="overflow-hidden rounded-xl shadow-sm border-none p-0">
        <CardHeader>
          <CardTitle className="text-xl">
            About
          </CardTitle>
          {/* {permissions.canEdit && (
            <Badge variant="secondary">Organization Admin</Badge>
          )} */}
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">asdflasdl asdfasodiawelk asdf asdfljasldfo</p>
        </CardContent>
        <CardHeader>
          <CardTitle className="text-xl">
            Website
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">www.example.com</p>
        </CardContent>
        <CardHeader>
          <CardTitle className="text-xl">
            Industry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">www.example.com</p>
        </CardContent>
        <CardHeader>
          <CardTitle className="text-xl">
            Company Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">{uniqueMembers.length} members</p>
        </CardContent>
        <CardHeader>
          <CardTitle className="text-xl">
            Specialities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">{uniqueMembers.length} members</p>
        </CardContent>
      </Card>
    </div>
  );
}
