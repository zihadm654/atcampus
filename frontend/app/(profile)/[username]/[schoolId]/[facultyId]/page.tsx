import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserDataSelect } from "@/types/types";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Users,
  BookOpen,
  GraduationCap,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Award,
  Building,
} from "lucide-react";
import { Metadata } from "next";
import { cache } from "react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ username: string; schoolId: string; facultyId: string }>;
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: {
      ...getUserDataSelect(loggedInUserId),
      institution: true,
      schools: {
        include: {
          faculties: true,
        },
      },
      // members: {
      //   include: {
      //     organization: {
      //       include: {
      //       },
      //     },
      //     faculty: true,
      //   },
      // },
    },
  });

  if (!user) notFound();

  return user;
});
const getFaculty = cache(async (facultyId: string) => {
  const faculty = await prisma.faculty.findUnique({
    where: {
      id: facultyId,
    },
    include: {
      members: {
        select: {
          id: true,
          role: true,
          department: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
              role: true,
              bio: true,
              instituteId: true,
              institution: true,
              phone: true,
              currentSemester: true,
              graduationYear: true,
            },
          },
        },
        orderBy: {
          role: "asc",
        },
      },
      school: {
        select: {
          id: true,
          name: true,
          institution: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          courses: true,
        },
      },
    },
  });
  return faculty;
});
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, schoolId, facultyId } = await params;

  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) throw new Error("User not logged in");

  const user = await getUser(username, loggedInUser.id);
  return {
    title: `${schoolId} (@${user.username})`,
  };
}
export default async function Page({ params }: PageProps) {
  const { username, facultyId, schoolId } = await params;
  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const user = await getUser(username, loggedInUser.id);
  const faculty = await getFaculty(facultyId);

  if (!faculty) {
    return notFound();
  }

  // Group members by role
  const professors = faculty?.members.filter(
    (member) => member.role === "PROFESSOR"
  );
  const students = faculty.members.filter(
    (member) => member.role === "STUDENT"
  );
  const admins = faculty.members.filter((member) =>
    [
      "FACULTY_ADMIN",
      "SCHOOL_ADMIN",
      "ORGANIZATION_ADMIN",
      "SUPER_ADMIN",
    ].includes(member.role)
  );

  const MemberCard = ({ member }: { member: (typeof faculty.members)[0] }) => {
    const userData = member.user;
    const isProfessor = member.role === "PROFESSOR";
    const isAdmin = [
      "FACULTY_ADMIN",
      "SCHOOL_ADMIN",
      "ORGANIZATION_ADMIN",
      "SUPER_ADMIN",
    ].includes(member.role);

    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={userData.image || undefined}
                alt={userData.name}
              />
              <AvatarFallback className="text-lg">
                {userData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {userData.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{userData.username}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                  {isProfessor && (
                    <Badge variant="outline" className="text-xs">
                      Professor
                    </Badge>
                  )}
                  {user.role === "INSTITUTION" &&
                    loggedInUser.id === user.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <DotsHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem className="text-sm">
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm text-destructive">
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{userData.email}</span>
                </div>
                {member.department && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{member.department}</span>
                  </div>
                )}
                {userData.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{userData.phone}</span>
                  </div>
                )}
                {userData.bio && (
                  <div className="text-sm text-muted-foreground">
                    <span>{userData.bio}</span>
                  </div>
                )}
              </div>

              {/* Academic Information for Professors */}
              {isProfessor && (
                <div className="space-y-3 pt-4 border-t">
                  {userData.institution && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {userData.institution}
                      </span>
                    </div>
                  )}
                  {userData.graduationYear && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Graduated {userData.graduationYear}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Faculty Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="relative h-64 w-full rounded-2xl overflow-hidden">
          {faculty.coverPhoto ? (
            <Image
              src={faculty.coverPhoto}
              alt={`${faculty.name} Cover`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Faculty Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end gap-4">
            {faculty.logo && (
              <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm">
                <Image
                  src={faculty.logo}
                  alt={`${faculty.name} Logo`}
                  fill
                  className="object-contain p-2"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{faculty.name}</h1>
              {faculty.shortName && (
                <p className="text-lg opacity-90">{faculty.shortName}</p>
              )}
              {faculty.school && (
                <Link
                  href={`/${username}/${faculty.school.id}`}
                  className="text-sm opacity-80 hover:underline inline-flex items-center gap-1"
                >
                  {faculty.school.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Details */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-3xl font-bold">
                  {faculty._count?.members || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <span className="text-3xl font-bold">{professors.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Professors</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <span className="text-3xl font-bold">
                  {faculty._count?.courses || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Courses</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-orange-600" />
                <span className="text-3xl font-bold">{students.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
          </div>

          {faculty.description && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-3">About This Faculty</h3>
              <p className="text-muted-foreground leading-relaxed">
                {faculty.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Faculty Members</h2>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="professors">
              Professors ({professors.length})
            </TabsTrigger>
            <TabsTrigger value="students">
              Students ({students.length})
            </TabsTrigger>
            <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculty.members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
            {faculty.members.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Members Found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    This faculty doesn't have any members yet. Members will
                    appear here once they are added.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="professors" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professors.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
            {professors.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Professors Found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    This faculty doesn't have any professors yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
            {students.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Students Found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    This faculty doesn't have any students yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="admins" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {admins.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
            {admins.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Award className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Admins Found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    This faculty doesn't have any administrators yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
