import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import { Skeleton } from "@/components/ui/skeleton";

interface Club {
  id: string;
  name: string;
  description?: string;
}

interface ClubsTabProps {
  user: any;
  loggedInUserId: string;
  permissions: any;
  loading?: boolean;
}

export default function ClubsTab({ user, loggedInUserId, permissions, loading = false }: ClubsTabProps) {
  const canEdit = permissions.canEdit || loggedInUserId === user.id;
  const canView = permissions.canViewPrivate || loggedInUserId === user.id;
  
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icons.lock className="size-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Access Restricted</h3>
        <p className="text-gray-500 text-center max-w-md">
          You don't have permission to view the clubs of this organization.
        </p>
      </div>
    );
  }

  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <section className="p-3">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-16" />
          {canEdit && <Skeleton className="h-8 w-24" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="p-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl">Clubs</h1>
        {canEdit && <Button>Create Club</Button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
        {user.clubs && user.clubs.length > 0 ? (
          user.clubs.map((club: Club) => (
            <Card key={club.id}>
              <CardHeader>
                <CardTitle>{club.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{club.description || 'No description available'}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-12">
            <Icons.users className="size-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Clubs Found</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              This organization doesn't have any clubs yet.
            </p>
            {canEdit && <Button>Create First Club</Button>}
          </div>
        )}
      </div>
    </section>
  );
}