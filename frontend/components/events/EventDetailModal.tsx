import { ExtendedEvent } from "@/types/event-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Users, Calendar, MapPin, Clock, Globe, Mail, Heart, Share2, MessageCircle, User } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventDetailModalProps {
  event: ExtendedEvent;
  open: boolean;
  onClose: () => void;
  onLike?: () => void;
  onJoin?: () => void;
  onMessage?: () => void;
}

export function EventDetailModal({ event, open, onClose, onLike, onJoin, onMessage }: EventDetailModalProps) {
  const [activeTab, setActiveTab] = useState("about");
  
  const attendeeCount = event.attendees?.filter(attendee => attendee.status === "ATTENDING").length || 0;
  const isLiked = event.isLiked || false;
  const isAttending = event.attendees && event.attendees.some(attendee => 
    attendee.status === "ATTENDING"
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLike}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="attendees">Attendees ({attendeeCount})</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                    
                    {event.tags && event.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Tags</h3>
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
                        <h3 className="font-semibold mb-2">Requirements</h3>
                        <p className="text-muted-foreground">
                          {event.requirements}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="attendees" className="mt-6">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {event.attendees?.filter(attendee => attendee.status === "ATTENDING").map((attendee) => (
                      <Card key={attendee.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={attendee.user.avatar || undefined} />
                                <AvatarFallback>
                                  {attendee.user.firstName?.charAt(0)}{attendee.user.lastName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {attendee.user.firstName} {attendee.user.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Registered {formatDistanceToNow(new Date(attendee.registeredAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">Attending</Badge>
                          </div>
                          {attendee.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Note: {attendee.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="details" className="mt-6">
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Event Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Event Type</p>
                          <Badge variant="secondary">{event.type}</Badge>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={event.status === "PUBLISHED" ? "default" : event.status === "DRAFT" ? "secondary" : "destructive"}>
                            {event.status}
                          </Badge>
                        </div>
                        
                        {event.maxAttendees && (
                          <div>
                            <p className="text-sm text-muted-foreground">Capacity</p>
                            <p className="font-medium">{event.maxAttendees} attendees max</p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Privacy</p>
                          <Badge variant="outline">{event.isPublic ? "Public" : "Private"}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Schedule</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date & Time</p>
                          <p className="font-medium">
                            {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                          </p>
                          <p className="text-sm">
                            {format(new Date(event.startDate), "h:mm a")}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">End Date & Time</p>
                          <p className="font-medium">
                            {format(new Date(event.endDate), "EEEE, MMMM d, yyyy")}
                          </p>
                          <p className="text-sm">
                            {format(new Date(event.endDate), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {event.location && (
                      <div>
                        <h3 className="font-semibold mb-2">Location</h3>
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
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(event.startDate), "MMM d, yyyy")}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {format(new Date(event.startDate), "h:mm a")}
                  </p>
                </div>
                
                {event.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground">Attendees</p>
                  <p className="font-medium">{attendeeCount}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                variant={isAttending ? "outline" : "default"}
                disabled={isEventPast}
                onClick={onJoin}
              >
                {isEventPast ? "Event Ended" : isAttending ? "Leave Event" : "Join Event"}
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={onMessage}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Organizer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}