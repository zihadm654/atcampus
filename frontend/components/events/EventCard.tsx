import { format, formatDistanceToNow } from "date-fns";
import { Calendar, Clock, Heart, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExtendedEvent } from "@/types/event-types";

interface EventCardProps {
  event: ExtendedEvent;
  onClick?: () => void;
  onLike?: () => void;
  onJoin?: () => void;
}

export function EventCard({ event, onClick, onLike, onJoin }: EventCardProps) {
  const attendeeCount =
    event.attendees?.filter((attendee: any) => attendee.status === "ATTENDING")
      .length || 0;
  const isLiked = event.isLiked;
  const isAttending = event.attendees?.some(
    (attendee: any) => attendee.status === "ATTENDING",
  );
  const isEventPast = new Date(event.endDate) < new Date();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-lg"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={event.coverPhoto || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60">
                {event.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="line-clamp-1 text-lg">
                {event.name}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {event.description}
              </CardDescription>
            </div>
          </div>
          <Button
            className={isLiked ? "text-red-500" : ""}
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            size="sm"
            variant="ghost"
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="secondary">{event.type}</Badge>
          {event.tags?.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
          {isEventPast && <Badge variant="destructive">Past Event</Badge>}
        </div>

        <div className="space-y-2 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
            {event.endDate && event.startDate !== event.endDate && (
              <span> - {format(new Date(event.endDate), "MMM d, yyyy")}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(event.startDate), "h:mm a")}</span>
            {event.endDate && (
              <span> - {format(new Date(event.endDate), "h:mm a")}</span>
            )}
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{attendeeCount} attending</span>
            {event.maxAttendees && <span> / {event.maxAttendees} max</span>}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-3">
        <div className="text-muted-foreground text-xs">
          Created{" "}
          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
        </div>
        <Button
          disabled={isEventPast}
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          size="sm"
          variant={isAttending ? "outline" : "default"}
        >
          {isEventPast
            ? "Event Ended"
            : isAttending
              ? "Attending"
              : "Join Event"}
        </Button>
      </CardFooter>
    </Card>
  );
}
