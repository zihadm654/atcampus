import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: string;
  name: string;
  description?: string;
}

interface EventsTabProps {
  user: any;
  loggedInUserId: string;
  permissions: any;
  loading?: boolean;
}

export default function EventsTab({ user, loggedInUserId, permissions, loading = false }: EventsTabProps) {
  const canEdit = permissions.canEdit || loggedInUserId === user.id;
  const canView = permissions.canViewPrivate || loggedInUserId === user.id;
  
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icons.lock className="size-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Access Restricted</h3>
        <p className="text-gray-500 text-center max-w-md">
          You don't have permission to view the events of this organization.
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
        <h1 className="text-xl">Events</h1>
        {canEdit && <Button>Create Event</Button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
        {user.events && user.events.length > 0 ? (
          user.events.map((event: Event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{event.description || 'No description available'}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-12">
            <Icons.calendar className="size-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Events Found</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              This organization doesn't have any events yet.
            </p>
            {canEdit && <Button>Create First Event</Button>}
          </div>
        )}
      </div>
    </section>
  );
}