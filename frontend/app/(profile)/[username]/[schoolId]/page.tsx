import { Button } from "@/components/ui/button";
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
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ProfessorList from "../_components/ProfessorList";
import Image from "next/image";
import Link from "next/link";

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
const getSchool = cache(async (schoolId: string) => {
  const school = await prisma.school.findUnique({
    where: {
      id: schoolId,
    },
    include: {
      faculties: true,
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
  return (
    <div className="w-full">
      <div className="bg-card h-fit w-full overflow-hidden rounded-2xl shadow-sm">
        {/* Cover photo area with enhanced gradient */}
        <div className="relative h-56 w-full">
          {school?.coverPhoto ? (
            <Image
              src={school.coverPhoto}
              alt="Cover Image"
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400" />
          )}
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 bg-black opacity-20 mix-blend-overlay" />
          <h3 className="absolute top-1/2 left-30 transform:[-50 -50] mx-auto text-3xl font-medium">
            {school?.name}
          </h3>
        </div>
      </div>
      <h1 className="text-2xl pt-3">Faculties</h1>
      <div className="mt-2">
        <div className="grid grid-cols-3 max-md:grid-cols-2 gap-2 w-full">
          {school?.faculties.map((faculty) => (
            <div
              key={faculty.id}
              className="mt-2 text-md border rounded-lg p-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg">
                  <Link href={`/${username}/${schoolId}/${faculty.id}`}>
                    {faculty.name}
                  </Link>
                </h4>
                {user.role === "INSTITUTION" && loggedInUser.id === user.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                      >
                        <DotsHorizontalIcon className="size-5" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                      // onClick={() =>
                      //     handleDeleteFaculty(faculty.id)
                      // }
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="text-gray-400">{faculty.description}</p>
              <ProfessorList facultyId={faculty.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
