import { format, formatDistanceToNow } from "date-fns";
import { Heart, MapPin, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ExtendedEvent } from "@/types/event-types";

interface EventDetailModalProps {
  event: ExtendedEvent;
  open: boolean;
  onClose: () => void;
  onLike?: () => void;
  onJoin?: () => void;
  onMessage?: () => void;
}

export function EventDetailModal({
  event,
  open,
  onClose,
  onLike,
  onJoin,
  onMessage,
}: EventDetailModalProps) {
  const [activeTab, setActiveTab] = useState("about");

  const attendeeCount =
    event.attendees?.filter((attendee: any) => attendee.status === "ATTENDING")
      .length || 0;
  const isLiked = event.isLiked;
  const isAttending = event.attendees?.some(
    (attendee: any) => attendee.status === "ATTENDING",
  );
  const isEventPast = new Date(event.endDate) < new Date();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={event.coverPhoto || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-xl">
                  {event.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{event.name}</DialogTitle>
                <CardDescription className="text-base">
                  {event.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleShare} size="sm" variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                className={isLiked ? "text-red-500" : ""}
                onClick={onLike}
                size="sm"
                variant="outline"
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="attendees">
                  Attendees ({attendeeCount})
                </TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent className="mt-6" value="about">
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-semibold">Description</h3>
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {event.description}
                      </p>
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.requirements && (
                      <div>
                        <h3 className="mb-2 font-semibold">Requirements</h3>
                        <p className="text-muted-foreground">
                          {event.requirements}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent className="mt-6" value="attendees">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {event.attendees
                      ?.filter(
                        (attendee: any) => attendee.status === "ATTENDING",
                      )
                      .map((attendee: any) => (
                        <Card key={attendee.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={attendee.user.avatar || undefined}
                                  />
                                  <AvatarFallback>
                                    {attendee.user.firstName?.charAt(0)}
                                    {attendee.user.lastName?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {attendee.user.firstName}{" "}
                                    {attendee.user.lastName}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    Registered{" "}
                                    {formatDistanceToNow(
                                      new Date(attendee.registeredAt),
                                      { addSuffix: true },
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline">Attending</Badge>
                            </div>
                            {attendee.notes && (
                              <p className="mt-2 text-muted-foreground text-sm">
                                Note: {attendee.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent className="mt-6" value="details">
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-semibold">Event Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Event Type
                          </p>
                          <Badge variant="secondary">{event.type}</Badge>
                        </div>

                        <div>
                          <p className="text-muted-foreground text-sm">
                            Status
                          </p>
                          <Badge
                            variant={
                              event.status === "PUBLISHED"
                                ? "default"
                                : event.status === "DRAFT"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {event.status}
                          </Badge>
                        </div>

                        {event.maxAttendees && (
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Capacity
                            </p>
                            <p className="font-medium">
                              {event.maxAttendees} attendees max
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-muted-foreground text-sm">
                            Privacy
                          </p>
                          <Badge variant="outline">
                            {event.isPublic ? "Public" : "Private"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-semibold">Schedule</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Start Date & Time
                          </p>
                          <p className="font-medium">
                            {format(
                              new Date(event.startDate),
                              "EEEE, MMMM d, yyyy",
                            )}
                          </p>
                          <p className="text-sm">
                            {format(new Date(event.startDate), "h:mm a")}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground text-sm">
                            End Date & Time
                          </p>
                          <p className="font-medium">
                            {format(
                              new Date(event.endDate),
                              "EEEE, MMMM d, yyyy",
                            )}
                          </p>
                          <p className="text-sm">
                            {format(new Date(event.endDate), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {event.location && (
                      <div>
                        <h3 className="mb-2 font-semibold">Location</h3>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm">Date</p>
                  <p className="font-medium">
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Time</p>
                  <p className="font-medium">
                    {format(new Date(event.startDate), "h:mm a")}
                  </p>
                </div>

                {event.location && (
                  <div>
                    <p className="text-muted-foreground text-sm">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground text-sm">Attendees</p>
                  <p className="font-medium">{attendeeCount}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">Created</p>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(event.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                className="w-full"
                disabled={isEventPast}
                onClick={onJoin}
                variant={isAttending ? "outline" : "default"}
              >
                {isEventPast
                  ? "Event Ended"
                  : isAttending
                    ? "Leave Event"
                    : "Join Event"}
              </Button>
              <Button className="w-full" onClick={onMessage} variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message Organizer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
