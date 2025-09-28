"use client";

import { EventCard } from "@/components/events/EventCard";
import { EventDetailModal } from "@/components/events/EventDetailModal";
import { getEventsAction } from "@/actions/event-actions";
import { joinEventAction, toggleEventLikeAction } from "@/actions/event-actions";
import { useState, useEffect } from "react";
import { ExtendedEvent } from "@/types/event-types";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ExtendedEvent | null>(null);
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
        type: eventType === "all" ? undefined : eventType as any,
        status: eventStatus === "all" ? undefined : eventStatus as any,
        limit: 20,
        page: 1
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
        userId: ""
      });
      if (result.isLiked !== undefined) {
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, isLiked: result.isLiked || false }
            : event
        ));
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const result = await joinEventAction({
        eventId,
        userId: ""
      });
      if (result.success) {
        loadEvents(); // Reload events to update attendance status
      }
    } catch (error) {
      console.error("Failed to join event:", error);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = eventType === "all" || event.type === eventType;
    const matchesStatus = eventStatus === "all" || event.status === eventStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Discover and join campus events</p>
        </div>
        {session?.user && (
          <Button onClick={() => router.push("/events/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={eventType} onValueChange={setEventType}>
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
        <Select value={eventStatus} onValueChange={setEventStatus}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted h-48 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => handleEventClick(event)}
              onLike={() => handleLikeEvent(event.id)}
              onJoin={() => handleJoinEvent(event.id)}
            />
          ))}
        </div>
      )}

      {filteredEvents.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No events found matching your criteria.</p>
        </div>
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          open={showModal}
          onClose={() => setShowModal(false)}
          onLike={() => handleLikeEvent(selectedEvent.id)}
          onJoin={() => handleJoinEvent(selectedEvent.id)}
          onMessage={() => {
            // Handle message organizer action
            console.log("Message organizer:", selectedEvent.creator?.name);
          }}
        />
      )}
    </div>
  );
}