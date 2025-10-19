import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getUserDataSelect } from "@/types/types";
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
    <div className="container mx-auto w-full space-y-6 max-md:p-3">
      {/* School Header Section */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="relative h-64 w-full overflow-hidden rounded-2xl">
          {school.coverPhoto ? (
            <Image
              alt={`${school.name} Cover`}
              className="object-cover"
              fill
              priority
              src={school.coverPhoto}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* School Info Overlay */}
        <div className="absolute right-0 bottom-0 left-0 p-6 text-white max-md:p-3">
          <div className="flex items-end gap-4">
            {school.logo && (
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm">
                <Image
                  alt={`${school.name} Logo`}
                  className="object-contain p-2"
                  fill
                  src={school.logo}
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="mb-2 font-bold text-4xl">{school.name}</h1>
              {school.shortName && (
                <p className="text-lg opacity-90">{school.shortName}</p>
              )}
              {school.description && (
                <p className="mt-2 text-sm opacity-80">{school.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Faculties Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-3xl">Faculties</h2>
          <Badge className="text-sm" variant="secondary">
            {school.faculties.length}{" "}
            {school.faculties.length === 1 ? "Faculty" : "Faculties"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {school.faculties && school.faculties.length > 0 ? (
            school.faculties.map((faculty) => (
              <FacultyCard
                faculty={faculty}
                key={faculty.id}
                schoolId={school.id}
                showActions={
                  user.role === "INSTITUTION" && loggedInUser.id === user.id
                }
                username={username}
              />
            ))
          ) : (
            <Card className="col-span-full border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-lg">
                  No Faculties Found
                </h3>
                <p className="max-w-md text-muted-foreground text-sm">
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
