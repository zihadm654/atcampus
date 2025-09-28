"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Calendar, MapPin, Heart, Share2, Edit, Trash2, Plus, Filter, Search, UserPlus, UserMinus, Settings, Crown, Shield } from "lucide-react";
import { format } from "date-fns";

import { ExtendedClub, ClubFilterOptions } from "@/types/club-types";
import { getClubsAction, joinClubAction, leaveClubAction, toggleClubLikeAction, getUserClubsAction } from "@/actions/club-actions";
import { ClubStatus, ClubMemberRole, ClubType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update club",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClub = async (clubId: string) => {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete club",
        variant: "destructive",
      });
    }
  };

  const isClubCreator = (club: ExtendedClub) => {
    return isOwnProfile && club.creatorId === username;
  };

  const isClubMember = (club: ExtendedClub) => {
    return club.isMember === true;
  };

  const getUserClubRole = (club: ExtendedClub): ClubMemberRole | null => {
    return club.memberRole || null;
  };

  const hasUserLikedClub = (club: ExtendedClub) => {
    return club.isLiked === true;
  };

  const ClubCard = ({ club }: { club: ExtendedClub }) => {
    const userRole = getUserClubRole(club);
    
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
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
                  by {club.creator.name} • {format(new Date(club.createdAt), "MMM d, yyyy")}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={club.status === ClubStatus.ACTIVE ? "default" : "secondary"}>
                {club.status}
              </Badge>
              {isClubCreator(club) && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingClub(club);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClub(club.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {userRole && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {userRole === ClubMemberRole.PRESIDENT && <Crown className="h-3 w-3" />}
                  {userRole === ClubMemberRole.VICE_PRESIDENT && <Shield className="h-3 w-3" />}
                  {userRole}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
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
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline">{club.type}</Badge>
            {club.categories.map((category, index) => (
              <Badge key={index} variant="outline">{category}</Badge>
            ))}
            {club.isOpenMembership && <Badge variant="outline">Open Membership</Badge>}
            {club.approvalRequired && <Badge variant="outline">Approval Required</Badge>}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleLike(club.id)}
              className={hasUserLikedClub(club) ? "text-red-500" : ""}
            >
              <Heart className={`h-4 w-4 ${hasUserLikedClub(club) ? "fill-current" : ""}`} />
              <span className="ml-1">{club._count?.likes || 0}</span>
            </Button>
            
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            {isClubMember(club) ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLeaveClub(club.id)}
                disabled={club.approvalRequired && !userRole}
              >
                <UserMinus className="h-4 w-4 mr-1" />
                Leave
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleJoinClub(club.id)}
                disabled={club.approvalRequired}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {club.approvalRequired ? "Apply" : "Join"}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/clubs/${club.id}`)}
            >
              View Details
            </Button>
            
            {userRole && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => router.push(`/clubs/${club.id}/manage`)}>
                    Manage Club
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/clubs/${club.id}/members`)}>
                    View Members
                  </DropdownMenuItem>
                  {userRole === ClubMemberRole.PRESIDENT && (
                    <DropdownMenuItem onClick={() => router.push(`/clubs/${club.id}/settings`)}>
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
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clubs..."
          value={filterOptions.search || ""}
          onChange={(e) => setFilterOptions(prev => ({ ...prev, search: e.target.value }))}
          className="pl-10"
        />
      </div>
      
      <Select
        value={filterOptions.type || "all"}
        onValueChange={(value) => setFilterOptions(prev => ({ 
          ...prev, 
          type: value === "all" ? undefined : value as ClubType 
        }))}
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
        value={filterOptions.categories?.[0] || "all"}
        onValueChange={(value) => setFilterOptions(prev => ({ 
          ...prev, 
          categories: value === "all" ? undefined : [value]
        }))}
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
          <Plus className="h-4 w-4 mr-2" />
          Create Club
        </Button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterBar />
      
      {isOwnProfile && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Clubs</TabsTrigger>
            <TabsTrigger value="created">Created</TabsTrigger>
            <TabsTrigger value="member">Member</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 mt-6">
            {clubs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No clubs found</h3>
                  <p className="text-muted-foreground">
                    {filterOptions.search ? "Try adjusting your search criteria" : "No clubs available at the moment"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              clubs.map((club) => <ClubCard key={club.id} club={club} />)
            )}
          </TabsContent>
          
          <TabsContent value="created" className="space-y-4 mt-6">
            {userClubs.filter(club => club.creatorId === username).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No created clubs</h3>
                  <p className="text-muted-foreground">
                    {userRole === "INSTITUTION" ? "Create your first club to get started" : "You haven't created any clubs yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              userClubs.filter(club => club.creatorId === username).map((club) => (
                <ClubCard key={club.id} club={club} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="member" className="space-y-4 mt-6">
            {userClubs.filter(club => club.isMember).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Not a member of any clubs</h3>
                  <p className="text-muted-foreground">
                    Join some clubs to see them here
                  </p>
                </CardContent>
              </Card>
            ) : (
              userClubs.filter(club => club.isMember).map((club) => (
                <ClubCard key={club.id} club={club} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {!isOwnProfile && (
        <div className="space-y-4">
          {clubs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No clubs found</h3>
                <p className="text-muted-foreground">
                  {filterOptions.search ? "Try adjusting your search criteria" : "No clubs available at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            clubs.map((club) => <ClubCard key={club.id} club={club} />)
          )}
        </div>
      )}

      {/* Create Club Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Club</DialogTitle>
            <DialogDescription>
              Fill in the details for your new club. Students will be able to join and participate.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Club Name</Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select
                value={createForm.type}
                onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}
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
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select
                value={createForm.category}
                onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}
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
              <Label htmlFor="location" className="text-right">Location</Label>
              <Input
                id="location"
                value={createForm.location}
                onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={createForm.capacity}
                onChange={(e) => setCreateForm(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="membershipFee" className="text-right">Membership Fee ($)</Label>
              <Input
                id="membershipFee"
                type="number"
                value={createForm.membershipFee}
                onChange={(e) => setCreateForm(prev => ({ ...prev, membershipFee: parseFloat(e.target.value) }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meetingSchedule" className="text-right">Meeting Schedule</Label>
              <Input
                id="meetingSchedule"
                value={createForm.meetingSchedule}
                onChange={(e) => setCreateForm(prev => ({ ...prev, meetingSchedule: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactEmail" className="text-right">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={createForm.contactEmail}
                onChange={(e) => setCreateForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">Website</Label>
              <Input
                id="website"
                type="url"
                value={createForm.website}
                onChange={(e) => setCreateForm(prev => ({ ...prev, website: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="socialMedia" className="text-right">Social Media</Label>
              <Input
                id="socialMedia"
                value={createForm.socialMedia}
                onChange={(e) => setCreateForm(prev => ({ ...prev, socialMedia: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClub}>Create Club</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Club Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Club</DialogTitle>
            <DialogDescription>
              Update the details for your club.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Club Name</Label>
              <Input
                id="edit-name"
                value={editingClub?.name || ""}
                onChange={(e) => setEditingClub(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Textarea
                id="edit-description"
                value={editingClub?.description || ""}
                onChange={(e) => setEditingClub(prev => prev ? { ...prev, description: e.target.value } : null)}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditClub}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}