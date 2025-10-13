import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserDataSelect } from "@/types/types";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ProfessorList from "../_components/ProfessorList";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Calendar,
  Globe,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { FacultyCard } from "../_components/FacultyCard";

interface PageProps {
  params: Promise<{ username: string; schoolId: string }>;
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
      members: true,
      userSkills: {
        include: {
          skill: {
            select: {
              name: true,
              category: true,
            },
          },
          _count: {
            select: {
              endorsements: true,
            },
          },
        },
        take: 10, // Limit for performance
      },
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
                take: 10, // Limit courses per faculty for initial load
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
      events: true,
      clubs: true,
    },
  });

  return user;
});
const getSchool = cache(async (schoolId: string) => {
  const school = await prisma.school.findUnique({
    where: {
      id: schoolId,
    },
    include: {
      faculties: {
        include: {
          _count: {
            select: {
              members: true,
              courses: true,
            },
          },
          members: {
            select: {
              id: true,
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  email: true,
                },
              },
            },
            take: 10, // Limit recent members preview
          },
          courses: {
            select: {
              id: true,
              title: true,
              code: true,
              enrollments: true,
            },
            where: {
              status: "PUBLISHED",
            },
            take: 10, // Limit courses for performance
          },
        },
        orderBy: {
          name: "asc",
        },
      },
      institution: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });
  return school;
});
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, schoolId } = await params;

  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) throw new Error("User not logged in");

  const user = await getUser(username, loggedInUser.id);
  if (!user) return {};
  return {
    title: `${schoolId} (@${user.username})`,
  };
}
export default async function Page({ params }: PageProps) {
  const { username, schoolId } = await params;
  const loggedInUser = await getCurrentUser();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const user = await getUser(username, loggedInUser.id);
  const school = await getSchool(schoolId);
  if (!user) return {};
  if (!school) {
    return notFound();
  }

  return (
    <div className="w-full space-y-6 container mx-auto max-md:p-3">
      {/* School Header Section */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="relative h-64 w-full rounded-2xl overflow-hidden">
          {school.coverPhoto ? (
            <Image
              src={school.coverPhoto}
              alt={`${school.name} Cover`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* School Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 max-md:p-3 text-white">
          <div className="flex items-end gap-4">
            {school.logo && (
              <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm">
                <Image
                  src={school.logo}
                  alt={`${school.name} Logo`}
                  fill
                  className="object-contain p-2"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{school.name}</h1>
              {school.shortName && (
                <p className="text-lg opacity-90">{school.shortName}</p>
              )}
              {school.description && (
                <p className="text-sm opacity-80 mt-2">{school.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Faculties Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Faculties</h2>
          <Badge variant="secondary" className="text-sm">
            {school.faculties.length}{" "}
            {school.faculties.length === 1 ? "Faculty" : "Faculties"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {school.faculties && school.faculties.length > 0 ? (
            school.faculties.map((faculty) => (
              <FacultyCard
                key={faculty.id}
                faculty={faculty}
                username={username}
                schoolId={school.id}
                showActions={
                  user.role === "INSTITUTION" && loggedInUser.id === user.id
                }
              />
            ))
          ) : (
            <Card className="col-span-full border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Faculties Found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  This school doesn't have any faculties yet. Faculties will
                  appear here once they are added.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
