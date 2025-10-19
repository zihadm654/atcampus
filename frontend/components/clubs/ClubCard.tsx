import { formatDistanceToNow } from "date-fns";
import { Calendar, Heart, MapPin, Users } from "lucide-react";
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
import type { ExtendedClub } from "@/types/club-types";

interface ClubCardProps {
  club: ExtendedClub;
  onClick?: () => void;
  onLike?: () => void;
  onJoin?: () => void;
}

export function ClubCard({ club, onClick, onLike, onJoin }: ClubCardProps) {
  const memberCount = club._count.members;
  const isLiked = club.isLiked;
  const isMember = club.isMember;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-lg"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={club.logo || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60">
                {club.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="line-clamp-1 text-lg">
                {club.name}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {club.description}
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
          <Badge variant="secondary">{club.type}</Badge>
          {club.tags?.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{memberCount} members</span>
          </div>
          {club.meetingSchedule && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{club.meetingSchedule}</span>
            </div>
          )}
          {club.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{club.location}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-3">
        <div className="text-muted-foreground text-xs">
          Created{" "}
          {formatDistanceToNow(new Date(club.createdAt), { addSuffix: true })}
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          size="sm"
          variant={isMember ? "outline" : "default"}
        >
          {isMember ? "Member" : "Join Club"}
        </Button>
      </CardFooter>
    </Card>
  );
}
