"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Icons } from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useActiveOrganization } from "@/lib/auth-client";
import type { UserData } from "@/types";

interface MembersTabProps {
  user: UserData;
  loggedInUserId: string;
  permissions: any;
  loading?: boolean;
}

interface Faculty {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

// Define the type for our assignment function
interface AssignFacultyParams {
  memberId: string;
  facultyId: string | null;
  organizationId: string;
}

// Action function to assign faculty to member
async function assignFacultyToMember({
  memberId,
  facultyId,
}: AssignFacultyParams) {
  const response = await fetch(`/api/members/${memberId}/faculty`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ facultyId }),
  });

  if (!response.ok) {
    throw new Error("Failed to assign faculty");
  }

  return response.json();
}

export default function MembersTab({
  user,
  loggedInUserId,
  permissions,
  loading = false,
}: MembersTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: activeOrganization, isPending: isLoadingOrganization } =
    useActiveOrganization();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  // Get current member role from active organization
  const currentMember = activeOrganization?.members?.find(
    (member: any) => member.userId === loggedInUserId
  );
  const hasAdminPermissions =
    currentMember?.role === "owner" || currentMember?.role === "admin";

  // Mutation hook for assigning faculty to member
  const assignFacultyMutation = useMutation({
    mutationFn: assignFacultyToMember,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["organization"] });

      // Snapshot the previous value
      const previousOrg = queryClient.getQueryData(["organization"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["organization"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          members:
            old.members?.map((member: any) =>
              member.id === variables.memberId
                ? { ...member, facultyId: variables.facultyId }
                : member
            ) || [],
        };
      });

      // Return a context object with the snapshotted value
      return { previousOrg };
    },
    onSuccess: (_updatedMember) => {
      toast({ description: "Faculty assigned successfully" });
    },
    onError: (_err, _variables, context) => {
      // Rollback to the previous value
      if (context?.previousOrg) {
        queryClient.setQueryData(["organization"], context.previousOrg);
      }
      toast({
        variant: "destructive",
        description: "Failed to assign faculty",
      });
    },
    onSettled: () => {
      // Refetch organization data
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });

  // Fetch faculties when organization changes
  useEffect(() => {
    if (hasAdminPermissions && activeOrganization?.id) {
      fetchFaculties(activeOrganization.id);
    }
  }, [hasAdminPermissions, activeOrganization?.id]);

  const fetchFaculties = async (organizationId: string) => {
    setLoadingFaculties(true);
    try {
      const response = await fetch(
        `/api/faculties?organizationId=${organizationId}`
      );
      if (response.ok) {
        const data = await response.json();
        setFaculties(data);
      }
    } catch (error) {
      console.error("Error fetching faculties:", error);
      toast({
        variant: "destructive",
        description: "Failed to load faculties",
      });
    } finally {
      setLoadingFaculties(false);
    }
  };

  // Show loading skeleton if data is loading
  if (loading || isLoadingOrganization) {
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
          {activeOrganization?.members &&
          activeOrganization.members.length > 0 ? (
            <div className="space-y-4">
              {activeOrganization.members.map((member: any) => (
                <div
                  className="flex items-center justify-between"
                  key={member.id}
                >
                  <div className="flex items-center space-x-4">
                    {member.user && <UserAvatar user={member.user} />}
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm leading-none">
                        {member.user?.name || "Unknown User"}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        {member.role}
                      </p>
                      {member.faculty && (
                        <p className="text-muted-foreground text-xs">
                          Faculty: {member.faculty.name}
                        </p>
                      )}
                    </div>
                  </div>
                  {hasAdminPermissions &&
                    member.role === "member" &&
                    member.user &&
                    activeOrganization.id && (
                      <div className="flex items-center gap-2">
                        <Select
                          disabled={assignFacultyMutation.isPending}
                          onValueChange={(value) =>
                            assignFacultyMutation.mutate({
                              memberId: member.id,
                              facultyId: value === "none" ? null : value,
                              organizationId: activeOrganization.id,
                            })
                          }
                          value={member.facultyId || ""}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Assign Faculty" />
                          </SelectTrigger>
                          <SelectContent>
                            {faculties.map((faculty) => (
                              <SelectItem key={faculty.id} value={faculty.id}>
                                {faculty.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
