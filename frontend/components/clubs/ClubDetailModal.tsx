import { ExtendedClub } from "@/types/club-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Users, Calendar, MapPin, Globe, Mail, Heart, Share2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClubDetailModalProps {
  club: ExtendedClub;
  open: boolean;
  onClose: () => void;
  onLike?: () => void;
  onJoin?: () => void;
  onMessage?: () => void;
}

export function ClubDetailModal({ club, open, onClose, onLike, onJoin, onMessage }: ClubDetailModalProps) {
  const [activeTab, setActiveTab] = useState("about");
  
  const memberCount = club._count.members;
  const isLiked = club.isLiked || false;
  const isMember = club.isMember || false;

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
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
                <TabsTrigger value="members">Members ({memberCount})</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {club.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Meeting Information</h3>
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
                        <h3 className="font-semibold mb-2">Tags</h3>
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
                      <h3 className="font-semibold mb-2">Contact & Social</h3>
                      <div className="space-y-2">
                        {club.contactEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${club.contactEmail}`} className="text-primary hover:underline">
                              {club.contactEmail}
                            </a>
                          </div>
                        )}
                        {club.websiteUrl && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={club.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
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
              
              <TabsContent value="members" className="mt-6">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <div className="text-center text-muted-foreground py-8">
                      Club members will appear here
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="events" className="mt-6">
                <ScrollArea className="h-96">
                  <div className="text-center text-muted-foreground py-8">
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
                  <p className="text-sm text-muted-foreground">Club Type</p>
                  <Badge variant="secondary">{club.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-medium">{memberCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(club.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                variant={isMember ? "outline" : "default"}
                onClick={onJoin}
              >
                {isMember ? "Leave Club" : "Join Club"}
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={onMessage}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Club
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}