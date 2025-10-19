"use client";

import { Calendar, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getEventsAction,
  joinEventAction,
  toggleEventLikeAction,
} from "@/actions/event-actions";
import { EventCard } from "@/components/events/EventCard";
import { EventDetailModal } from "@/components/events/EventDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import type { ExtendedEvent } from "@/types/event-types";

export default function EventsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ExtendedEvent | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [eventType, setEventType] = useState<string>("all");
  const [eventStatus, setEventStatus] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await getEventsAction({
        search: searchTerm || undefined,
        type: eventType === "all" ? undefined : (eventType as any),
        status: eventStatus === "all" ? undefined : (eventStatus as any),
        limit: 20,
        page: 1,
      });

      if (result.data) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: ExtendedEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleLikeEvent = async (eventId: string) => {
    try {
      const result = await toggleEventLikeAction({
        eventId,
        userId: "",
      });
      if (result.isLiked !== undefined) {
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId ? { ...event, isLiked: result.isLiked } : event
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const result = await joinEventAction({
        eventId,
        userId: "",
      });
      if (result.success) {
        loadEvents(); // Reload events to update attendance status
      }
    } catch (error) {
      console.error("Failed to join event:", error);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !searchTerm ||
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = eventType === "all" || event.type === eventType;
    const matchesStatus = eventStatus === "all" || event.status === eventStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Events</h1>
          <p className="text-muted-foreground">
            Discover and join campus events
          </p>
        </div>
        {session?.user && (
          <Button onClick={() => router.push("/events/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events..."
            value={searchTerm}
          />
        </div>
        <Select onValueChange={setEventType} value={eventType}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ACADEMIC">Academic</SelectItem>
            <SelectItem value="SOCIAL">Social</SelectItem>
            <SelectItem value="SPORTS">Sports</SelectItem>
            <SelectItem value="CULTURAL">Cultural</SelectItem>
            <SelectItem value="WORKSHOP">Workshop</SelectItem>
            <SelectItem value="SEMINAR">Seminar</SelectItem>
            <SelectItem value="CONFERENCE">Conference</SelectItem>
            <SelectItem value="NETWORKING">Networking</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setEventStatus} value={eventStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="UPCOMING">Upcoming</SelectItem>
            <SelectItem value="ONGOING">Ongoing</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={loadEvents}>Search</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...new Array(6)].map((_, i) => (
            <div className="animate-pulse" key={i}>
              <div className="h-48 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard
              event={event}
              key={event.id}
              onClick={() => handleEventClick(event)}
              onJoin={() => handleJoinEvent(event.id)}
              onLike={() => handleLikeEvent(event.id)}
            />
          ))}
        </div>
      )}

      {filteredEvents.length === 0 && !loading && (
        <div className="py-12 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No events found matching your criteria.
          </p>
        </div>
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setShowModal(false)}
          onJoin={() => handleJoinEvent(selectedEvent.id)}
          onLike={() => handleLikeEvent(selectedEvent.id)}
          onMessage={() => {
            // Handle message organizer action
            console.log("Message organizer:", selectedEvent.creator?.name);
          }}
          open={showModal}
        />
      )}
    </div>
  );
}
