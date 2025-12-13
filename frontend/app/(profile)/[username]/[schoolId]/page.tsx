import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getUserDataSelect } from "@/types/types";
import EditSchoolDialog from "../_components/EditSchoolDialog";
import Client from "./client";

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
              },
              members: {
                include: {
                  user: true,
                },
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

  if (!user) notFound();

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
  if (!user) return { title: "User not found" };
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

  if (!(user && school)) {
    return notFound();
  }

  // Check if the current user can manage this school
  const canManageSchool =
    user.role === "INSTITUTION" && loggedInUser.id === user.id;

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
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="mb-2 font-bold text-4xl">{school.name}</h1>
                  {school.shortName && (
                    <p className="text-lg opacity-90">{school.shortName}</p>
                  )}
                  {school.description && (
                    <p className="mt-2 text-sm opacity-80">
                      {school.description}
                    </p>
                  )}
                </div>
                {canManageSchool && <EditSchoolDialogButton school={school} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Faculties Section */}
      <div className="space-y-4">
        <Suspense fallback="loading....">
          <Client
            canManageSchool={canManageSchool}
            school={school}
            username={username}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Client component for the Edit School Dialog
function EditSchoolDialogButton({ school }: { school: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Edit School
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit School</DialogTitle>
          <DialogDescription>Edit School Information</DialogDescription>
        </DialogHeader>
        <EditSchoolDialog school={school} />
      </DialogContent>
    </Dialog>
  );
}
