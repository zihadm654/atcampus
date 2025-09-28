"use client";

import { ClubCard } from "@/components/clubs/ClubCard";
import { ClubDetailModal } from "@/components/clubs/ClubDetailModal";
import { getClubsAction } from "@/actions/club-actions";
import { joinClubAction, toggleClubLikeAction } from "@/actions/club-actions";
import { useState, useEffect } from "react";
import { ExtendedClub } from "@/types/club-types";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ClubType } from "@prisma/client";

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
        type: clubType === "all" ? undefined : clubType as any,
        limit: 20,
        page: 1
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
        userId: session?.user?.id || ""
      });
      if (result.success) {
        setClubs(prev => prev.map(club => 
          club.id === clubId 
            ? { ...club, isLiked: result.isLiked || false }
            : club
        ));
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      const result = await joinClubAction({
        clubId,
        userId: session?.user?.id || ""
      });
      if (result.success) {
        loadClubs(); // Reload clubs to update membership status
      }
    } catch (error) {
      console.error("Failed to join club:", error);
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = !searchTerm || 
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = clubType === "all" || club.type === clubType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Clubs & Organizations</h1>
          <p className="text-muted-foreground">Discover and join student clubs</p>
        </div>
        {session?.user && (
          <Button onClick={() => router.push("/clubs/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Club
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={clubType} onValueChange={setClubType}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted h-48 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onClick={() => handleClubClick(club)}
              onLike={() => handleLikeClub(club.id)}
              onJoin={() => handleJoinClub(club.id)}
            />
          ))}
        </div>
      )}

      {filteredClubs.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No clubs found matching your criteria.</p>
        </div>
      )}

      {selectedClub && (
        <ClubDetailModal
          club={selectedClub}
          open={showModal}
          onClose={() => setShowModal(false)}
          onLike={() => handleLikeClub(selectedClub.id)}
          onJoin={() => handleJoinClub(selectedClub.id)}
          onMessage={() => {
            // Handle message club action
            console.log("Message club:", selectedClub.name);
          }}
        />
      )}
    </div>
  );
}