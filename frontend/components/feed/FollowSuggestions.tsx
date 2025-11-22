"use client";

import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/shared/icons";
import Link from "next/link";
import FollowButton from "@/components/feed/FollowButton";
import { Skeleton } from "@/components/ui/skeleton";

interface SuggestedUser {
  id: string;
  username: string;
  name: string;
  image: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  instituteId: string | null;
  institution: string | null;
  _count: {
    followers: number;
  };
}

// Simplified user type for avatar component
interface AvatarUser {
  image: string | null;
  name: string;
  username: string;
}

interface FollowSuggestionsProps {
  limit?: number;
  className?: string;
}

// Simplified UserAvatar component for this specific use case
function SimpleUserAvatar({ user, size = 48, className = "" }: { user: AvatarUser; size?: number; className?: string }) {
  return (
    <Avatar className={className} style={{ width: size, height: size }}>
      {user.image ? (
        <AvatarImage
          alt="Picture"
          referrerPolicy="no-referrer"
          src={user.image}
        />
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name || user.username}</span>
          <Icons.user className="size-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}

export default function FollowSuggestions({ limit = 3, className }: FollowSuggestionsProps) {
  const { data: suggestedUsers, isLoading, error } = useQuery({
    queryKey: ["follow-suggestions", limit],
    queryFn: async () => {
      const response = await kyInstance.get(`/api/users/suggestions?limit=${limit}`).json<{ suggestions: SuggestedUser[] }>();
      return response.suggestions;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>People you may know</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !suggestedUsers || suggestedUsers.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>People you may know</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href={`/${user.username}`}>
                  <SimpleUserAvatar
                    user={{
                      image: user.image,
                      name: user.name,
                      username: user.username
                    }}
                    size={48}
                    className="cursor-pointer"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/${user.username}`}>
                    <h4 className="font-semibold text-sm hover:underline cursor-pointer truncate">
                      {user.name || user.username}
                    </h4>
                  </Link>
                  <p className="text-sm text-muted-foreground truncate">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="text-xs text-muted-foreground truncate">
                      {user.bio}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {user._count.followers} followers
                  </p>
                </div>
              </div>
              <FollowButton
                userId={user.id}
                initialState={{
                  followers: user._count.followers,
                  isFollowedByUser: false,
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/search">View all suggestions</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}