import { Building, School } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfilePermissions } from "@/types/profile-types";
import type { UserData } from "@/types/types";

interface InstitutionOverviewProps {
  user: UserData;
  permissions: ProfilePermissions;
  isOwnProfile: boolean;
}

export default function InstitutionOverview({
  user,
  permissions,
  isOwnProfile,
}: InstitutionOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Institution Info */}
      <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center font-medium text-lg">
            <Building className="mr-2 size-5" />
            Institution Overview
          </CardTitle>
          {permissions.canEdit && (
            <Badge variant="secondary">Institution Admin</Badge>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-gray-500 text-sm">{user.institution}</p>
            </div>

            {/* {organizationData && organizationData.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium flex items-center">
                                        <Users className="size-4 mr-2" />
                                        Organizations
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {organizationData.map((org) => (
                                            <div key={org.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <p className="font-medium">{org.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {org._count.schools} schools • {org._count.members} members
                                                    </p>
                                                </div>
                                                <Badge variant="outline">{org._count.schools} Schools</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )} */}
          </div>
        </CardContent>
      </Card>

      {/* Schools & Faculties Overview */}
      <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center font-medium text-lg">
            <School className="mr-2 size-5" />
            Academic Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="py-8 text-center text-gray-500">
            <School className="mx-auto mb-3 size-12" />
            <p>Academic structure information will be displayed here</p>
            {permissions.canEdit && isOwnProfile && (
              <p className="mt-2 text-sm">
                Add schools and faculties to get started
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
