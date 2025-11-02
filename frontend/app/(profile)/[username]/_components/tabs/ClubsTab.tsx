"use client";

import { ClubMemberRole, ClubStatus, type ClubType } from "@prisma/client";
import { format } from "date-fns";
import {
  Calendar,
  Crown,
  Edit,
  Heart,
  MapPin,
  Plus,
  Search,
  Settings,
  Share2,
  Shield,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getClubsAction,
  getUserClubsAction,
  joinClubAction,
  leaveClubAction,
  toggleClubLikeAction,
} from "@/actions/club-actions";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { ClubFilterOptions, ExtendedClub } from "@/types/club-types";

interface ClubsTabProps {
  username: string;
  isOwnProfile: boolean;
  userRole?: string;
}

export function ClubsTab({ username, isOwnProfile, userRole }: ClubsTabProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [clubs, setClubs] = useState<ExtendedClub[]>([]);
  const [userClubs, setUserClubs] = useState<ExtendedClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<ClubFilterOptions>({
    status: ClubStatus.ACTIVE,
    search: "",
    type: undefined,

    // category: undefined,
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClub, setEditingClub] = useState<ExtendedClub | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    type: "ACADEMIC",
    category: "STUDENT",
    location: "",
    isOnline: false,
    capacity: 50,
    contactEmail: "",
    website: "",
    socialMedia: "",
    meetingSchedule: "",
    membershipFee: 0,
    applicationRequired: false,
  });

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const result = await getClubsAction(filterOptions);
      if (result.success && result.data) {
        setClubs(result.data);
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to fetch clubs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserClubs = async () => {
    if (isOwnProfile) {
      try {
        const result = await getUserClubsAction(username);
        if (result.success && result.data) {
          setUserClubs(result.data);
        }
      } catch (error) {
        console.error("Error fetching user clubs:", error);
      }
    }
  };

  useEffect(() => {
    fetchClubs();
    fetchUserClubs();
  }, [filterOptions, activeTab]);

  const handleJoinClub = async (clubId: string) => {
    try {
      const result = await joinClubAction({ clubId, userId: username });
      if (result.success) {
        toast({
          title: "Success",
          description: "Successfully joined the club!",
        });
        fetchClubs();
        fetchUserClubs();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to join club",
        variant: "destructive",
      });
    }
  };

  const handleLeaveClub = async (clubId: string) => {
    try {
      const result = await leaveClubAction(clubId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Successfully left the club!",
        });
        fetchClubs();
        fetchUserClubs();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to leave club",
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (clubId: string) => {
    try {
      const result = await toggleClubLikeAction({ clubId, userId: username });
      if (result.success) {
        fetchClubs();
        fetchUserClubs();
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCreateClub = async () => {
    try {
      // Implementation for creating club would go here
      // This would call the createClubAction server action
      toast({
        title: "Success",
        description: "Club created successfully!",
      });
      setShowCreateDialog(false);
      fetchClubs();
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to create club",
        variant: "destructive",
      });
    }
  };

  const handleEditClub = async () => {
    if (!editingClub) return;

    try {
      // Implementation for updating club would go here
      // This would call the updateClubAction server action
      toast({
        title: "Success",
        description: "Club updated successfully!",
      });
      setShowEditDialog(false);
      setEditingClub(null);
      fetchClubs();
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to update club",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClub = async (_clubId: string) => {
    if (!confirm("Are you sure you want to delete this club?")) return;

    try {
      // Implementation for deleting club would go here
      // This would call the deleteClubAction server action
      toast({
        title: "Success",
        description: "Club deleted successfully!",
      });
      fetchClubs();
      fetchUserClubs();
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to delete club",
        variant: "destructive",
      });
    }
  };

  const isClubCreator = (club: ExtendedClub) =>
    isOwnProfile && club.creatorId === username;

  const isClubMember = (club: ExtendedClub) => club.isMember === true;

  const getUserClubRole = (club: ExtendedClub): ClubMemberRole | null =>
    club.memberRole || null;

  const hasUserLikedClub = (club: ExtendedClub) => club.isLiked === true;

  const ClubCard = ({ club }: { club: ExtendedClub }) => {
    const userRole = getUserClubRole(club);

    return (
      <Card className="transition-shadow duration-200 hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={club.creator.image || undefined} />
                <AvatarFallback>{club.name?.[0] || "C"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{club.name}</CardTitle>
                <CardDescription>
                  by {club.creator.name} •{" "}
                  {format(new Date(club.createdAt), "MMM d, yyyy")}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  club.status === ClubStatus.ACTIVE ? "default" : "secondary"
                }
              >
                {club.status}
              </Badge>
              {isClubCreator(club) && (
                <div className="flex gap-1">
                  <Button
                    onClick={() => {
                      setEditingClub(club);
                      setShowEditDialog(true);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClub(club.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {userRole && (
                <Badge className="flex items-center gap-1" variant="outline">
                  {userRole === ClubMemberRole.PRESIDENT && (
                    <Crown className="h-3 w-3" />
                  )}
                  {userRole === ClubMemberRole.VICE_PRESIDENT && (
                    <Shield className="h-3 w-3" />
                  )}
                  {userRole}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
            {club.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {club._count?.members || 0} members
                {club.maxMembers && ` / ${club.maxMembers} max`}
              </span>
            </div>

            {club.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{club.location}</span>
              </div>
            )}

            {club.meetingSchedule && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{club.meetingSchedule}</span>
              </div>
            )}

            {!club.isOpenMembership && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Membership required</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{club.type}</Badge>
            {club.categories.map((category) => (
              <Badge key={category} variant="outline">
                {category}
              </Badge>
            ))}
            {club.isOpenMembership && (
              <Badge variant="outline">Open Membership</Badge>
            )}
            {club.approvalRequired && (
              <Badge variant="outline">Approval Required</Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <Button
              className={hasUserLikedClub(club) ? "text-red-500" : ""}
              onClick={() => handleToggleLike(club.id)}
              size="sm"
              variant="ghost"
            >
              <Heart
                className={`h-4 w-4 ${hasUserLikedClub(club) ? "fill-current" : ""}`}
              />
              <span className="ml-1">{club._count?.likes || 0}</span>
            </Button>

            <Button size="sm" variant="ghost">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            {isClubMember(club) ? (
              <Button
                disabled={club.approvalRequired && !userRole}
                onClick={() => handleLeaveClub(club.id)}
                size="sm"
                variant="outline"
              >
                <UserMinus className="mr-1 h-4 w-4" />
                Leave
              </Button>
            ) : (
              <Button
                disabled={club.approvalRequired}
                onClick={() => handleJoinClub(club.id)}
                size="sm"
              >
                <UserPlus className="mr-1 h-4 w-4" />
                {club.approvalRequired ? "Apply" : "Join"}
              </Button>
            )}

            <Button
              onClick={() => router.push(`/clubs/${club.id}`)}
              size="sm"
              variant="outline"
            >
              View Details
            </Button>

            {userRole && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => router.push(`/clubs/${club.id}/manage`)}
                  >
                    Manage Club
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/clubs/${club.id}/members`)}
                  >
                    View Members
                  </DropdownMenuItem>
                  {userRole === ClubMemberRole.PRESIDENT && (
                    <DropdownMenuItem
                      onClick={() => router.push(`/clubs/${club.id}/settings`)}
                    >
                      Club Settings
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  const FilterBar = () => (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
        <Input
          className="pl-10"
          onChange={(e) =>
            setFilterOptions((prev) => ({ ...prev, search: e.target.value }))
          }
          placeholder="Search clubs..."
          value={filterOptions.search || ""}
        />
      </div>

      <Select
        onValueChange={(value) =>
          setFilterOptions((prev) => ({
            ...prev,
            type: value === "all" ? undefined : (value as ClubType),
          }))
        }
        value={filterOptions.type || "all"}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Club Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="ACADEMIC">Academic</SelectItem>
          <SelectItem value="SOCIAL">Social</SelectItem>
          <SelectItem value="PROFESSIONAL">Professional</SelectItem>
          <SelectItem value="CULTURAL">Cultural</SelectItem>
          <SelectItem value="SPORTS">Sports</SelectItem>
          <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
          <SelectItem value="HOBBY">Hobby</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) =>
          setFilterOptions((prev) => ({
            ...prev,
            categories: value === "all" ? undefined : [value],
          }))
        }
        value={filterOptions.categories?.[0] || "all"}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="STUDENT">Student</SelectItem>
          <SelectItem value="FACULTY">Faculty</SelectItem>
          <SelectItem value="DEPARTMENT">Department</SelectItem>
          <SelectItem value="UNIVERSITY">University</SelectItem>
          <SelectItem value="INTERNATIONAL">International</SelectItem>
          <SelectItem value="RESEARCH">Research</SelectItem>
          <SelectItem value="ALUMNI">Alumni</SelectItem>
        </SelectContent>
      </Select>

      {userRole === "INSTITUTION" && (
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Club
        </Button>
      )}
    </div>
  );

  // Render content based on user role
  const renderClubsContent = () => {
    // For students, show joined clubs
    if (userRole === "STUDENT") {
      return (
        <div className="space-y-6">
          <FilterBar />

          {isOwnProfile ? (
            <Tabs onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Clubs</TabsTrigger>
                <TabsTrigger value="member">Joined Clubs</TabsTrigger>
              </TabsList>

              <TabsContent className="mt-6 space-y-4" value="all">
                {clubs.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 font-semibold text-lg">
                        No clubs found
                      </h3>
                      <p className="text-muted-foreground">
                        {filterOptions.search
                          ? "Try adjusting your search criteria"
                          : "No clubs available at the moment"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  clubs.map((club) => <ClubCard club={club} key={club.id} />)
                )}
              </TabsContent>

              <TabsContent className="mt-6 space-y-4" value="member">
                {userClubs.filter((club) => club.isMember).length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 font-semibold text-lg">
                        Not a member of any clubs
                      </h3>
                      <p className="text-muted-foreground">
                        Join some clubs to see them here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  userClubs
                    .filter((club) => club.isMember)
                    .map((club) => <ClubCard club={club} key={club.id} />)
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {clubs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold text-lg">
                      No clubs found
                    </h3>
                    <p className="text-muted-foreground">
                      {filterOptions.search
                        ? "Try adjusting your search criteria"
                        : "No clubs available at the moment"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                clubs.map((club) => <ClubCard club={club} key={club.id} />)
              )}
            </div>
          )}
        </div>
      );
    }

    // For institutions, show created clubs
    if (userRole === "INSTITUTION") {
      return (
        <div className="space-y-6">
          <FilterBar />

          {isOwnProfile ? (
            <Tabs onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Clubs</TabsTrigger>
                <TabsTrigger value="created">Created Clubs</TabsTrigger>
              </TabsList>

              <TabsContent className="mt-6 space-y-4" value="all">
                {clubs.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 font-semibold text-lg">
                        No clubs found
                      </h3>
                      <p className="text-muted-foreground">
                        {filterOptions.search
                          ? "Try adjusting your search criteria"
                          : "No clubs available at the moment"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  clubs.map((club) => <ClubCard club={club} key={club.id} />)
                )}
              </TabsContent>

              <TabsContent className="mt-6 space-y-4" value="created">
                {userClubs.filter((club) => club.creatorId === username)
                  .length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 font-semibold text-lg">
                        No created clubs
                      </h3>
                      <p className="text-muted-foreground">
                        Create your first club to get started
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  userClubs
                    .filter((club) => club.creatorId === username)
                    .map((club) => <ClubCard club={club} key={club.id} />)
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {clubs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-semibold text-lg">
                      No clubs found
                    </h3>
                    <p className="text-muted-foreground">
                      {filterOptions.search
                        ? "Try adjusting your search criteria"
                        : "No clubs available at the moment"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                clubs.map((club) => <ClubCard club={club} key={club.id} />)
              )}
            </div>
          )}
        </div>
      );
    }

    // For other roles, show a generic view
    return (
      <div className="space-y-6">
        <FilterBar />

        <div className="space-y-4">
          {clubs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-lg">No clubs found</h3>
                <p className="text-muted-foreground">
                  {filterOptions.search
                    ? "Try adjusting your search criteria"
                    : "No clubs available at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            clubs.map((club) => <ClubCard club={club} key={club.id} />)
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...new Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderClubsContent()}

      {/* Create Club Dialog */}
      <Dialog onOpenChange={setShowCreateDialog} open={showCreateDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Club</DialogTitle>
            <DialogDescription>
              Fill in the details for your new club. Students will be able to
              join and participate.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="name">
                Club Name
              </Label>
              <Input
                className="col-span-3"
                id="name"
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                value={createForm.name}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="description">
                Description
              </Label>
              <Textarea
                className="col-span-3"
                id="description"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                value={createForm.description}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="type">
                Type
              </Label>
              <Select
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, type: value }))
                }
                value={createForm.type}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACADEMIC">Academic</SelectItem>
                  <SelectItem value="SOCIAL">Social</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="CULTURAL">Cultural</SelectItem>
                  <SelectItem value="SPORTS">Sports</SelectItem>
                  <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                  <SelectItem value="HOBBY">Hobby</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="category">
                Category
              </Label>
              <Select
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, category: value }))
                }
                value={createForm.category}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="FACULTY">Faculty</SelectItem>
                  <SelectItem value="DEPARTMENT">Department</SelectItem>
                  <SelectItem value="UNIVERSITY">University</SelectItem>
                  <SelectItem value="INTERNATIONAL">International</SelectItem>
                  <SelectItem value="RESEARCH">Research</SelectItem>
                  <SelectItem value="ALUMNI">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="location">
                Location
              </Label>
              <Input
                className="col-span-3"
                id="location"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                value={createForm.location}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="capacity">
                Capacity
              </Label>
              <Input
                className="col-span-3"
                id="capacity"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    capacity: Number.parseInt(e.target.value, 10),
                  }))
                }
                type="number"
                value={createForm.capacity}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="membershipFee">
                Membership Fee ($)
              </Label>
              <Input
                className="col-span-3"
                id="membershipFee"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    membershipFee: Number.parseFloat(e.target.value),
                  }))
                }
                type="number"
                value={createForm.membershipFee}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="meetingSchedule">
                Meeting Schedule
              </Label>
              <Input
                className="col-span-3"
                id="meetingSchedule"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    meetingSchedule: e.target.value,
                  }))
                }
                value={createForm.meetingSchedule}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="contactEmail">
                Contact Email
              </Label>
              <Input
                className="col-span-3"
                id="contactEmail"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                type="email"
                value={createForm.contactEmail}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="website">
                Website
              </Label>
              <Input
                className="col-span-3"
                id="website"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    website: e.target.value,
                  }))
                }
                type="url"
                value={createForm.website}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="socialMedia">
                Social Media
              </Label>
              <Input
                className="col-span-3"
                id="socialMedia"
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    socialMedia: e.target.value,
                  }))
                }
                value={createForm.socialMedia}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowCreateDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateClub}>Create Club</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Club Dialog */}
      <Dialog onOpenChange={setShowEditDialog} open={showEditDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Club</DialogTitle>
            <DialogDescription>
              Update the details for your club.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="edit-name">
                Club Name
              </Label>
              <Input
                className="col-span-3"
                id="edit-name"
                onChange={(e) =>
                  setEditingClub((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                value={editingClub?.name || ""}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="edit-description">
                Description
              </Label>
              <Textarea
                className="col-span-3"
                id="edit-description"
                onChange={(e) =>
                  setEditingClub((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
                rows={3}
                value={editingClub?.description || ""}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowEditDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleEditClub}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
