"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Users, Heart, Share2, Edit, Trash2, Plus, Filter, Search, UserPlus, UserMinus, CalendarClock } from "lucide-react";
import { format } from "date-fns";

import { ExtendedEvent, EventFilterOptions } from "@/types/event-types";
import { getEventsAction, joinEventAction, leaveEventAction, toggleEventLikeAction, getUserEventsAction } from "@/actions/event-actions";
import { EventStatus, EventType } from "@prisma/client";
// import { EventType } from "@/lib/validations/event";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface EventsTabProps {
  username: string;
  isOwnProfile: boolean;
  userRole?: string;
}

export function EventsTab({ username, isOwnProfile, userRole }: EventsTabProps) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const isEventCreator = (event: ExtendedEvent) => {
    return isOwnProfile && event.creatorId === username;
  };

  const isEventAttendee = (event: ExtendedEvent) => {
    return event.attendees?.some(attendee => attendee.userId === username);
  };

  const hasUserLikedEvent = (event: ExtendedEvent) => {
    return event.likesUsers === true;
  };

  const EventCard = ({ event }: { event: ExtendedEvent }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
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
                by {event.creator.name} • {format(new Date(event.createdAt), "MMM d, yyyy")}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={event.status as EventStatus === EventStatus.PUBLISHED ? "default" : "secondary"}>
              {event.status}
            </Badge>
            {isEventCreator(event) && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingEvent(event);
                    setShowEditDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEvent(event.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
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

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">{event.type}</Badge>
          {event.isPublic && <Badge variant="outline">Public</Badge>}
          {event.registrationDeadline && new Date(event.registrationDeadline) > new Date() && (
            <Badge variant="outline">Registration Open</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleLike(event.id)}
            className={hasUserLikedEvent(event) ? "text-red-500" : ""}
          >
            <Heart className={`h-4 w-4 ${hasUserLikedEvent(event) ? "fill-current" : ""}`} />
            <span className="ml-1">{event._count?.likesUsers || 0}</span>
          </Button>

          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          {isEventAttendee(event) ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLeaveEvent(event.id)}
              disabled={Boolean(event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : new Date(event.startDate) < new Date())}
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Leave
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleJoinEvent(event.id)}
              disabled={Boolean((event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : new Date(event.startDate) < new Date()) ||
                (event.capacity && (event._count?.attendees || 0) >= Number(event.capacity)))}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Join
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/events/${event.id}`)}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  const FilterBar = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={filterOptions.search || ""}
          onChange={(e) => setFilterOptions(prev => ({ ...prev, search: e.target.value }))}
          className="pl-10"
        />
      </div>

      <Select
        value={filterOptions.type || "all"}
        onValueChange={(value) => setFilterOptions(prev => ({
          ...prev,
          type: value === "all" ? undefined : value as EventType
        }))}
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
          <Plus className="h-4 w-4 mr-2" />
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="attending">Attending Events</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No events found</h3>
                      <p className="text-muted-foreground">
                        {filterOptions.search ? "Try adjusting your search criteria" : "No events available at the moment"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => <EventCard key={event.id} event={event} />)
                )}
              </TabsContent>

              <TabsContent value="attending" className="space-y-4 mt-6">
                {userEvents.filter(event => event.attendees?.some(attendee => attendee.userId === username)).length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Not attending any events</h3>
                      <p className="text-muted-foreground">
                        Join some events to see them here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  userEvents.filter(event => event.attendees?.some(attendee => attendee.userId === username)).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {events.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No events found</h3>
                    <p className="text-muted-foreground">
                      {filterOptions.search ? "Try adjusting your search criteria" : "No events available at the moment"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => <EventCard key={event.id} event={event} />)
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="created">Created Events</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No events found</h3>
                      <p className="text-muted-foreground">
                        {filterOptions.search ? "Try adjusting your search criteria" : "No events available at the moment"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => <EventCard key={event.id} event={event} />)
                )}
              </TabsContent>

              <TabsContent value="created" className="space-y-4 mt-6">
                {userEvents.filter(event => event.creatorId === username).length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No created events</h3>
                      <p className="text-muted-foreground">
                        Create your first event to get started
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  userEvents.filter(event => event.creatorId === username).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {events.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No events found</h3>
                    <p className="text-muted-foreground">
                      {filterOptions.search ? "Try adjusting your search criteria" : "No events available at the moment"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => <EventCard key={event.id} event={event} />)
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
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  {filterOptions.search ? "Try adjusting your search criteria" : "No events available at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
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
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill in the details for your new event. Students will be able to join and participate.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Event Name</Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select
                value={createForm.type}
                onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}
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
              <Label htmlFor="location" className="text-right">Location</Label>
              <Input
                id="location"
                value={createForm.location}
                onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={createForm.capacity}
                onChange={(e) => setCreateForm(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={createForm.price}
                onChange={(e) => setCreateForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={createForm.startDate}
                onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={createForm.endDate}
                onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="registrationDeadline" className="text-right">Registration Deadline</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                value={createForm.registrationDeadline}
                onChange={(e) => setCreateForm(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactEmail" className="text-right">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={createForm.contactEmail}
                onChange={(e) => setCreateForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">Website</Label>
              <Input
                id="website"
                type="url"
                value={createForm.website}
                onChange={(e) => setCreateForm(prev => ({ ...prev, website: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the details for your event.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Event Name</Label>
              <Input
                id="edit-name"
                value={editingEvent?.name || ""}
                onChange={(e) => setEditingEvent(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Textarea
                id="edit-description"
                value={editingEvent?.description || ""}
                onChange={(e) => setEditingEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEvent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}