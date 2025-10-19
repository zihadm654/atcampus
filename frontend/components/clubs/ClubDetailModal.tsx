import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Globe,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Share2,
} from "lucide-react";
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
import type { ExtendedClub } from "@/types/club-types";

interface ClubDetailModalProps {
  club: ExtendedClub;
  open: boolean;
  onClose: () => void;
  onLike?: () => void;
  onJoin?: () => void;
  onMessage?: () => void;
}

export function ClubDetailModal({
  club,
  open,
  onClose,
  onLike,
  onJoin,
  onMessage,
}: ClubDetailModalProps) {
  const [activeTab, setActiveTab] = useState("about");

  const memberCount = club._count.members;
  const isLiked = club.isLiked;
  const isMember = club.isMember;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: club.name,
        text: club.description,
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
                <AvatarImage src={club.logo || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-xl">
                  {club.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{club.name}</DialogTitle>
                <CardDescription className="text-base">
                  {club.description}
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
                <TabsTrigger value="members">
                  Members ({memberCount})
                </TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>

              <TabsContent className="mt-6" value="about">
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-semibold">Description</h3>
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {club.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-2 font-semibold">
                        Meeting Information
                      </h3>
                      <div className="space-y-2">
                        {club.meetingSchedule && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{club.meetingSchedule}</span>
                          </div>
                        )}
                        {club.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{club.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {club.tags && club.tags.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {club.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="mb-2 font-semibold">Contact & Social</h3>
                      <div className="space-y-2">
                        {club.contactEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a
                              className="text-primary hover:underline"
                              href={`mailto:${club.contactEmail}`}
                            >
                              {club.contactEmail}
                            </a>
                          </div>
                        )}
                        {club.websiteUrl && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a
                              className="text-primary hover:underline"
                              href={club.websiteUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {club.websiteUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent className="mt-6" value="members">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <div className="py-8 text-center text-muted-foreground">
                      Club members will appear here
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent className="mt-6" value="events">
                <ScrollArea className="h-96">
                  <div className="py-8 text-center text-muted-foreground">
                    Club events will appear here
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm">Club Type</p>
                  <Badge variant="secondary">{club.type}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Members</p>
                  <p className="font-medium">{memberCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Created</p>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(club.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={onJoin}
                variant={isMember ? "outline" : "default"}
              >
                {isMember ? "Leave Club" : "Join Club"}
              </Button>
              <Button className="w-full" onClick={onMessage} variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message Club
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
