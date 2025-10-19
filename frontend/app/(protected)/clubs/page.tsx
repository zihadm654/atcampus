"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getClubsAction,
  joinClubAction,
  toggleClubLikeAction,
} from "@/actions/club-actions";
import { ClubCard } from "@/components/clubs/ClubCard";
import { ClubDetailModal } from "@/components/clubs/ClubDetailModal";
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
import type { ExtendedClub } from "@/types/club-types";

export default function ClubsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [clubs, setClubs] = useState<ExtendedClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<ExtendedClub | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clubType, setClubType] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const result = await getClubsAction({
        search: searchTerm || undefined,
        type: clubType === "all" ? undefined : (clubType as any),
        limit: 20,
        page: 1,
      });

      if (result.data) {
        setClubs(result.data);
      }
    } catch (error) {
      console.error("Failed to load clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClubClick = (club: ExtendedClub) => {
    setSelectedClub(club);
    setShowModal(true);
  };

  const handleLikeClub = async (clubId: string) => {
    try {
      const result = await toggleClubLikeAction({
        clubId,
        userId: session?.user?.id || "",
      });
      if (result.success) {
        setClubs((prev) =>
          prev.map((club) =>
            club.id === clubId ? { ...club, isLiked: result.isLiked } : club
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      const result = await joinClubAction({
        clubId,
        userId: session?.user?.id || "",
      });
      if (result.success) {
        loadClubs(); // Reload clubs to update membership status
      }
    } catch (error) {
      console.error("Failed to join club:", error);
    }
  };

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      !searchTerm ||
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = clubType === "all" || club.type === clubType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Clubs & Organizations</h1>
          <p className="text-muted-foreground">
            Discover and join student clubs
          </p>
        </div>
        {session?.user && (
          <Button onClick={() => router.push("/clubs/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Club
          </Button>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clubs..."
            value={searchTerm}
          />
        </div>
        <Select onValueChange={setClubType} value={clubType}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ACADEMIC">Academic</SelectItem>
            <SelectItem value="SOCIAL">Social</SelectItem>
            <SelectItem value="SPORTS">Sports</SelectItem>
            <SelectItem value="CULTURAL">Cultural</SelectItem>
            <SelectItem value="PROFESSIONAL">Professional</SelectItem>
            <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={loadClubs}>Search</Button>
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
          {filteredClubs.map((club) => (
            <ClubCard
              club={club}
              key={club.id}
              onClick={() => handleClubClick(club)}
              onJoin={() => handleJoinClub(club.id)}
              onLike={() => handleLikeClub(club.id)}
            />
          ))}
        </div>
      )}

      {filteredClubs.length === 0 && !loading && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No clubs found matching your criteria.
          </p>
        </div>
      )}

      {selectedClub && (
        <ClubDetailModal
          club={selectedClub}
          onClose={() => setShowModal(false)}
          onJoin={() => handleJoinClub(selectedClub.id)}
          onLike={() => handleLikeClub(selectedClub.id)}
          onMessage={() => {
            // Handle message club action
            console.log("Message club:", selectedClub.name);
          }}
          open={showModal}
        />
      )}
    </div>
  );
}
