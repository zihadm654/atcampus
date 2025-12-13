import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  Award,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  School,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import Course from "@/components/courses/Course";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getUserDataSelect } from "@/types/types";

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
      schools: {
        include: {
          faculties: {
            include: {
              courses: {
                include: {
                  instructor: true,
                  _count: {
                    select: {
                      enrollments: true,
                    },
                  },
                },
                take: 5, // Limit courses per faculty for initial load
              },
              _count: {
                select: {
                  courses: true,
                  members: true,
                },
              },
            },
          },
        },
      },
      members: true,
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
      courses: {
        include: {
          instructor: {
            select: {
              id: true,
              username: true,
              name: true,
              bio: true,
              role: true,
              institution: true,
              instituteId: true,
              status: true,
              currentSemester: true,
              image: true,
              coverImage: true,
              email: true,
              emailVerified: true,
              displayUsername: true,
              createdAt: true,
            },
          },
          instructorCourses: true,
          faculty: {
            include: {
              school: {
                include: {
                  institution: true,
                },
              },
            },
          },
          enrollments: {
            include: {
              course: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
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
  const { username, schoolId } = await params;

  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) throw new Error("User not logged in");

  const user = await getUser(username, loggedInUser.id);
  return {
    title: `${schoolId} (@${user.username})`,
  };
}
export default async function Page({ params }: PageProps) {
  const { username, facultyId } = await params;
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
    (member) => member.role === "member",
  );
  const admins = faculty.members.filter((member) =>
    ["owner", "admin"].includes(member.role),
  );

  const MemberCard = ({ member }: { member: (typeof faculty.members)[0] }) => {
    const userData = member.user;
    const isProfessor = member.role === "member";
    const isAdmin = ["admin", "owner"].includes(member.role);

    return (
      <Card className="group transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage
                  alt={userData.name}
                  src={userData.image || undefined}
                />
                <AvatarFallback className="text-lg">
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      {userData.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      @{userData.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Badge className="text-xs" variant="secondary">
                        Admin
                      </Badge>
                    )}
                    {isProfessor && (
                      <Badge className="text-xs" variant="outline">
                        Professor
                      </Badge>
                    )}
                    {user.role === "INSTITUTION" &&
                      loggedInUser.id === user.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                              size="sm"
                              variant="ghost"
                            >
                              <DotsHorizontalIcon className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem className="text-sm">
                              Edit Member
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive text-sm">
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Mail className="h-4 w-4" />
              <span>{userData.email}</span>
            </div>
            {userData.phone && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4" />
                <span>{userData.phone}</span>
              </div>
            )}
            {userData.instituteId && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <School className="h-4 w-4" />
                <span>{userData.instituteId}</span>
              </div>
            )}
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
        <div className="relative h-64 w-full overflow-hidden rounded-2xl">
          {faculty.coverPhoto ? (
            <Image
              alt={`${faculty.name} Cover`}
              className="object-cover"
              fill
              priority
              src={faculty.coverPhoto}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Faculty Info Overlay */}
        <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
          <div className="flex items-end gap-4">
            {faculty.logo && (
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm">
                <Image
                  alt={`${faculty.name} Logo`}
                  className="object-contain p-2"
                  fill
                  src={faculty.logo}
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="mb-2 font-bold text-4xl">{faculty.name}</h1>
              {faculty.shortName && (
                <p className="text-lg opacity-90">{faculty.shortName}</p>
              )}
              {faculty.school && (
                <Link
                  className="inline-flex items-center gap-1 text-sm opacity-80 hover:underline"
                  href={`/${username}/${faculty.school.id}`}
                >
                  {faculty.school.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="space-y-6">
        <h2 className="font-bold text-3xl">Faculty Members</h2>

        <Tabs className="w-full" defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Members ({professors?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="professors">
              Professors ({professors.length})
            </TabsTrigger>
            <TabsTrigger value="courses">
              Courses ({faculty?.courses?.length || 0})
            </TabsTrigger>
            {/* <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger> */}
          </TabsList>

          <TabsContent className="mt-3" value="all">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {faculty.members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
            {faculty.members.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold text-lg">
                    No Members Found
                  </h3>
                  <p className="max-w-md text-muted-foreground text-sm">
                    This faculty doesn't have any members yet. Members will
                    appear here once they are added.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent className="mt-3" value="professors">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {professors.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
            {professors.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold text-lg">
                    No Professors Found
                  </h3>
                  <p className="max-w-md text-muted-foreground text-sm">
                    This faculty doesn't have any professors yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent className="mt-3" value="courses">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {faculty?.courses?.map((course: any) => (
                <Course course={course} key={course.id} />
              ))}
            </div>
            {(!faculty?.courses || faculty?.courses?.length === 0) && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold text-lg">
                    No Courses Found
                  </h3>
                  <p className="max-w-md text-muted-foreground text-sm">
                    This faculty doesn't have any courses yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent className="mt-3" value="admins">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {admins.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
            {admins.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Award className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-semibold text-lg">
                    No Admins Found
                  </h3>
                  <p className="max-w-md text-muted-foreground text-sm">
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
