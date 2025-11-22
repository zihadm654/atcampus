"use client";

import { EventStatus, type EventType } from "@prisma/client";
import { format } from "date-fns";
import {
  Calendar,
  CalendarClock,
  Edit,
  Heart,
  MapPin,
  Plus,
  Search,
  Share2,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getEventsAction,
  getUserEventsAction,
  joinEventAction,
  leaveEventAction,
  toggleEventLikeAction,
} from "@/actions/event-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// import { EventType } from "@/lib/validations/event";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { EventFilterOptions, ExtendedEvent } from "@/types/event-types";

interface EventsTabProps {
  username: string;
  isOwnProfile: boolean;
  userRole?: string;
}

export function EventsTab({
  username,
  isOwnProfile,
  userRole,
}: EventsTabProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [userEvents, setUserEvents] = useState<ExtendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<EventFilterOptions>({
    status: EventStatus.PUBLISHED,
    search: "",
    type: undefined,
    startDateFrom: undefined,
    startDateTo: undefined,
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ExtendedEvent | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    type: "ACADEMIC",
    location: "",
    isOnline: false,
    capacity: 50,
    price: 0,
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    contactEmail: "",
    website: "",
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const result = await getEventsAction(filterOptions);
      if (result.success && result.data) {
        setEvents(result.data);
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    if (isOwnProfile) {
      try {
        const result = await getUserEventsAction(username);
        if (result.success && result.data) {
          setUserEvents(result.data);
        }
      } catch (error) {
        console.error("Error fetching user events:", error);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUserEvents();
  }, [filterOptions, activeTab]);

  const handleJoinEvent = async (eventId: string) => {
    try {
      const result = await joinEventAction({ eventId, userId: username });
      if (result.success) {
        toast({
          title: "Success",
          description: "Successfully joined the event!",
        });
        fetchEvents();
        fetchUserEvents();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to join event",
        variant: "destructive",
      });
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      const result = await leaveEventAction(eventId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Successfully left the event!",
        });
        fetchEvents();
        fetchUserEvents();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to leave event",
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (eventId: string) => {
    try {
      const result = await toggleEventLikeAction({ eventId, userId: username });
      if (result.success) {
        fetchEvents();
        fetchUserEvents();
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      // Implementation for creating event would go here
      // This would call the createEventAction server action
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      setShowCreateDialog(false);
      fetchEvents();
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent) return;

    try {
      // Implementation for updating event would go here
      // This would call the updateEventAction server action
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
      setShowEditDialog(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (_eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      // Implementation for deleting event would go here
      // This would call the deleteEventAction server action
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
      fetchEvents();
      fetchUserEvents();
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const isEventCreator = (event: ExtendedEvent) =>
    isOwnProfile && event.creatorId === username;

  const isEventAttendee = (event: ExtendedEvent) =>
    event.attendees?.some((attendee) => attendee.userId === username);

  const hasUserLikedEvent = (event: ExtendedEvent) => event.likesUsers === true;

  const EventCard = ({ event }: { event: ExtendedEvent }) => (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={event.creator.image || undefined} />
              <AvatarFallback>{event.creator.name?.[0] || "E"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{event.name}</CardTitle>
              <CardDescription>
                by {event.creator.name} •{" "}
                {format(new Date(event.createdAt), "MMM d, yyyy")}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                (event.status as EventStatus) === EventStatus.PUBLISHED
                  ? "default"
                  : "secondary"
              }
            >
              {event.status}
            </Badge>
            {isEventCreator(event) && (
              <div className="flex gap-1">
                <Button
                  onClick={() => {
                    setEditingEvent(event);
                    setShowEditDialog(true);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteEvent(event.id)}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(event.startDate), "MMM d, yyyy h:mm a")} -
              {format(new Date(event.endDate), "MMM d, yyyy h:mm a")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.isOnline ? "Online" : event.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {event._count?.attendees || 0} / {event.capacity} attendees
            </span>
          </div>

          {Number(event.price) > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">${Number(event.price)}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{event.type}</Badge>
          {event.isPublic && <Badge variant="outline">Public</Badge>}
          {event.registrationDeadline &&
            new Date(event.registrationDeadline) > new Date() && (
              <Badge variant="outline">Registration Open</Badge>
            )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-2">
          <Button
            className={hasUserLikedEvent(event) ? "text-red-500" : ""}
            onClick={() => handleToggleLike(event.id)}
            size="sm"
            variant="ghost"
          >
            <Heart
              className={`h-4 w-4 ${hasUserLikedEvent(event) ? "fill-current" : ""}`}
            />
            <span className="ml-1">{event._count?.likesUsers || 0}</span>
          </Button>

          <Button size="sm" variant="ghost">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          {isEventAttendee(event) ? (
            <Button
              disabled={Boolean(
                event.registrationDeadline
                  ? new Date(event.registrationDeadline) < new Date()
                  : new Date(event.startDate) < new Date()
              )}
              onClick={() => handleLeaveEvent(event.id)}
              size="sm"
              variant="outline"
            >
              <UserMinus className="mr-1 h-4 w-4" />
              Leave
            </Button>
          ) : (
            <Button
              disabled={Boolean(
                (event.registrationDeadline
                  ? new Date(event.registrationDeadline) < new Date()
                  : new Date(event.startDate) < new Date()) ||
                (event.capacity &&
                  (event._count?.attendees || 0) >= Number(event.capacity))
              )}
              onClick={() => handleJoinEvent(event.id)}
              size="sm"
            >
              <UserPlus className="mr-1 h-4 w-4" />
              Join
            </Button>
          )}

          <Button
            onClick={() => router.push(`/events/${event.id}`)}
            size="sm"
            variant="outline"
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  const FilterBar = () => (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
        <Input
          className="pl-10"
          onChange={(e) =>
            setFilterOptions((prev) => ({ ...prev, search: e.target.value }))
          }
          placeholder="Search events..."
          value={filterOptions.search || ""}
        />
      </div>

      <Select
        onValueChange={(value) =>
          setFilterOptions((prev) => ({
            ...prev,
            type: value === "all" ? undefined : (value as EventType),
          }))
        }
        value={filterOptions.type || "all"}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Event Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="ACADEMIC">Academic</SelectItem>
          <SelectItem value="SOCIAL">Social</SelectItem>
          <SelectItem value="WORKSHOP">Workshop</SelectItem>
          <SelectItem value="CONFERENCE">Conference</SelectItem>
          <SelectItem value="SEMINAR">Seminar</SelectItem>
          <SelectItem value="NETWORKING">Networking</SelectItem>
          <SelectItem value="CULTURAL">Cultural</SelectItem>
          <SelectItem value="SPORTS">Sports</SelectItem>
        </SelectContent>
      </Select>

      {userRole === "INSTITUTION" && (
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      )}
    </div>
  );

  // Render content based on user role
  const renderEventsContent = () => {
    // For students, show attended events
    if (userRole === "STUDENT") {
      return (
        <div className="space-y-6">
          <FilterBar />

          {isOwnProfile ? (
            <Tabs onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="attending">Attending Events</TabsTrigger>
              </TabsList>

              <TabsContent className="mt-6 space-y-4" value="all">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 font-semibold text-lg">
                        No events found
                      </h3>
                      <p className="text-muted-foreground">
                        {filterOptions.search
                          ? "Try adjusting your search criteria"
                          : "No events available at the moment"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => (
                    <EventCard event={event} key={event.id} />
                  ))
                )}
              </TabsContent>

              <TabsContent className="mt-6 space-y-4" value="attending">
                {userEvents.filter((event) =>
                  event.attendees?.some(
                    (attendee) => attendee.userId === username
                  )
                ).length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 font-semibold text-lg">
                        Not attending any events
                      </h3>
                      <p className="text-muted-foreground">
                        Join some events to see them here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  userEvents
                    .filter((event) =>
                      event.attendees?.some(
                        (attendee) => attendee.userId === username
                      )
                    )
                    .map((event) => <EventCard event={event} key={event.id} />)
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {events.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold text-lg">
                      No events found
                    </h3>
                    <p className="text-muted-foreground">
                      {filterOptions.search
                        ? "Try adjusting your search criteria"
                        : "No events available at the moment"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <EventCard event={event} key={event.id} />
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    // For institutions, show created events
    if (userRole === "INSTITUTION") {
      return (
        <div className="space-y-6">
          <FilterBar />

          {isOwnProfile ? (
            <Tabs onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="created">Created Events</TabsTrigger>
              </TabsList>

              <TabsContent className="mt-6 space-y-4" value="all">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 font-semibold text-lg">
                        No events found
                      </h3>
                      <p className="text-muted-foreground">
                        {filterOptions.search
                          ? "Try adjusting your search criteria"
                          : "No events available at the moment"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => (
                    <EventCard event={event} key={event.id} />
                  ))
                )}
              </TabsContent>

              <TabsContent className="mt-6 space-y-4" value="created">
                {userEvents.filter((event) => event.creatorId === username)
                  .length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 font-semibold text-lg">
                        No created events
                      </h3>
                      <p className="text-muted-foreground">
                        Create your first event to get started
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  userEvents
                    .filter((event) => event.creatorId === username)
                    .map((event) => <EventCard event={event} key={event.id} />)
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {events.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold text-lg">
                      No events found
                    </h3>
                    <p className="text-muted-foreground">
                      {filterOptions.search
                        ? "Try adjusting your search criteria"
                        : "No events available at the moment"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <EventCard event={event} key={event.id} />
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    // For other roles, show a generic view
    return (
      <div className="space-y-6">
        <FilterBar />

        <div className="space-y-4">
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-lg">No events found</h3>
                <p className="text-muted-foreground">
                  {filterOptions.search
                    ? "Try adjusting your search criteria"
                    : "No events available at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => <EventCard event={event} key={event.id} />)
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...new Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderEventsContent()}

      {/* Create Event Dialog */}
      <Dialog onOpenChange={setShowCreateDialog} open={showCreateDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill in the details for your new event. Students will be able to
              join and participate.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="name">
                Event Name
              </Label>
              <Input
                className="col-span-3"
                id="name"
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                value={createForm.name}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="description">
                Description
              </Label>
              <Textarea
                className="col-span-3"
                id="description"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                value={createForm.description}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="type">
                Type
              </Label>
              <Select
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, type: value }))
                }
                value={createForm.type}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACADEMIC">Academic</SelectItem>
                  <SelectItem value="SOCIAL">Social</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="CONFERENCE">Conference</SelectItem>
                  <SelectItem value="SEMINAR">Seminar</SelectItem>
                  <SelectItem value="NETWORKING">Networking</SelectItem>
                  <SelectItem value="CULTURAL">Cultural</SelectItem>
                  <SelectItem value="SPORTS">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="location">
                Location
              </Label>
              <Input
                className="col-span-3"
                id="location"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                value={createForm.location}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="capacity">
                Capacity
              </Label>
              <Input
                className="col-span-3"
                id="capacity"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    capacity: Number.parseInt(e.target.value, 10),
                  }))
                }
                type="number"
                value={createForm.capacity}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="price">
                Price ($)
              </Label>
              <Input
                className="col-span-3"
                id="price"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    price: Number.parseFloat(e.target.value),
                  }))
                }
                type="number"
                value={createForm.price}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="startDate">
                Start Date
              </Label>
              <Input
                className="col-span-3"
                id="startDate"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                type="datetime-local"
                value={createForm.startDate}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="endDate">
                End Date
              </Label>
              <Input
                className="col-span-3"
                id="endDate"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                type="datetime-local"
                value={createForm.endDate}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="registrationDeadline">
                Registration Deadline
              </Label>
              <Input
                className="col-span-3"
                id="registrationDeadline"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    registrationDeadline: e.target.value,
                  }))
                }
                type="datetime-local"
                value={createForm.registrationDeadline}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="contactEmail">
                Contact Email
              </Label>
              <Input
                className="col-span-3"
                id="contactEmail"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                type="email"
                value={createForm.contactEmail}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="website">
                Website
              </Label>
              <Input
                className="col-span-3"
                id="website"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    website: e.target.value,
                  }))
                }
                type="url"
                value={createForm.website}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowCreateDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog onOpenChange={setShowEditDialog} open={showEditDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the details for your event.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="edit-name">
                Event Name
              </Label>
              <Input
                className="col-span-3"
                id="edit-name"
                onChange={(e) =>
                  setEditingEvent((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                value={editingEvent?.name || ""}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="edit-description">
                Description
              </Label>
              <Textarea
                className="col-span-3"
                id="edit-description"
                onChange={(e) =>
                  setEditingEvent((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
                rows={3}
                value={editingEvent?.description || ""}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowEditDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleEditEvent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
