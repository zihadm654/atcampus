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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

    </div>
  );
}
