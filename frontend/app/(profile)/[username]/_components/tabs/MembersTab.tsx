import { Icons } from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserData } from "@/types";

interface MembersTabProps {
  user: UserData;
  loggedInUserId: string;
  permissions: any;
  loading?: boolean;
}

export default function MembersTab({ user, loading = false }: MembersTabProps) {
  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-4">
            <div className="flex items-center font-medium text-lg">
              <Skeleton className="mr-3 h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-3"
                  key={i}
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For institutions, show a simplified list of members
  return (
    <div className="grid grid-cols-1 gap-3">
      <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
        <CardHeader className="flex items-center justify-between pb-4">
          <CardTitle className="flex items-center font-medium text-lg">
            <Icons.users className="mr-3 size-5" />
            <span>Institution Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.members && user.members.length > 0 ? (
            <div className="space-y-4">
              {user.members.map((member: any) => (
                <div className="flex items-center space-x-4" key={member.id}>
                  <UserAvatar user={member} />
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm leading-none">
                      {member.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <Icons.users className="size-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No schools or members found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
