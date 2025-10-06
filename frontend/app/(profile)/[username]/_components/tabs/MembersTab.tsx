import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/lib/validations/auth";

interface Member {
  id: string;
  userId: string;
  organizationId: string;
  facultyId?: string;
  role: string;
  website?: string;
  researchInterests: string[];
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
  };
  faculty?: {
    id: string;
    name: string;
  };
}

interface MembersTabProps {
  user: any;
  loggedInUserId: string;
  permissions: any;
  loading?: boolean;
}

export default function MembersTab({
  user,
  loggedInUserId,
  permissions,
  loading = false,
}: MembersTabProps) {
  const canView = permissions.canViewPrivate || loggedInUserId === user.id;

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icons.lock className="size-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          You don't have permission to view the members of this organization.
        </p>
      </div>
    );
  }

  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-4">
            <div className="flex items-center text-lg font-medium">
              <Skeleton className="h-5 w-5 mr-3 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
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

  // Render content based on user role
  const renderMembersContent = () => {
    // For organizations, show organization members
    if (user.role === UserRole.ORGANIZATION) {
      return (
        <div className="grid grid-cols-1 gap-3">
          <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <CardHeader className="flex items-center justify-between pb-4">
              <CardTitle className="flex items-center text-lg font-medium">
                <Icons.users className="mr-3 size-5" />
                <span>Organization Members</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.members && user.members.length > 0 ? (
                <div className="space-y-3">
                  {user.members.map((member: Member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.organization?.name?.charAt(0) || "O"}
                        </div>
                        <div>
                          <div className="font-medium">
                            {member.organization?.name || "Unknown Organization"}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {member.role.toLowerCase().replace("_", " ")}
                          </div>
                          {member.faculty && (
                            <div className="text-xs text-blue-600">
                              {member.faculty.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <Icons.users className="size-12 text-gray-400" />
                  <p className="text-gray-500 mt-2">No organization memberships</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // For institutions, show school/faculty members
    if (user.role === UserRole.INSTITUTION) {
      return (
        <div className="grid grid-cols-1 gap-3">
          <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <CardHeader className="flex items-center justify-between pb-4">
              <CardTitle className="flex items-center text-lg font-medium">
                <Icons.users className="mr-3 size-5" />
                <span>School Members</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.schools && user.schools.length > 0 ? (
                <div className="space-y-4">
                  {user.schools.map((school: any) => (
                    <div key={school.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{school.name}</h3>
                      {school.faculties && school.faculties.length > 0 ? (
                        <div className="space-y-3">
                          {school.faculties.map((faculty: any) => (
                            <div key={faculty.id} className="ml-4">
                              <h4 className="font-medium">{faculty.name}</h4>
                              {faculty.members && faculty.members.length > 0 ? (
                                <div className="mt-2 space-y-2">
                                  {faculty.members.map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-2 text-sm">
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        {member.user?.name?.charAt(0) || "U"}
                                      </div>
                                      <span>{member.user?.name || "Unknown User"}</span>
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {member.role}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm mt-1">No members in this faculty</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No faculties in this school</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <Icons.users className="size-12 text-gray-400" />
                  <p className="text-gray-500 mt-2">No schools or members found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // For admins, show all members
    if (user.role === UserRole.ADMIN) {
      return (
        <div className="grid grid-cols-1 gap-3">
          <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <CardHeader className="flex items-center justify-between pb-4">
              <CardTitle className="flex items-center text-lg font-medium">
                <Icons.users className="mr-3 size-5" />
                <span>All Members</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.members && user.members.length > 0 ? (
                <div className="space-y-3">
                  {user.members.map((member: Member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.organization?.name?.charAt(0) || "M"}
                        </div>
                        <div>
                          <div className="font-medium">
                            {member.user?.name || "Unknown Member"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.organization?.name || "Unknown Organization"}
                          </div>
                          <div className="text-xs text-blue-600 capitalize">
                            {member.role.toLowerCase().replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <Icons.users className="size-12 text-gray-400" />
                  <p className="text-gray-500 mt-2">No members found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // For other roles, show a generic message
    return (
      <div className="p-4 text-center text-gray-500">
        Member information is not applicable for this user role.
      </div>
    );
  };

  return renderMembersContent();
}