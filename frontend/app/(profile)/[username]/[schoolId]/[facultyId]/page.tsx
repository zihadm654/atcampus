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
import Image from "next/image";
import Link from "next/link";

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
      members: true,
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
  return (
    <div className="w-full">
      <h1 className="text-2xl pt-3">Faculty Members</h1>
      <div className="mt-2">
        <div className="grid grid-cols-3 max-md:grid-cols-2 gap-2 w-full">
          {faculty && faculty.members && faculty.members.length > 0 ? (
            faculty?.members.map((member) => (
              <div
                key={member.id}
                className="mt-2 text-md border rounded-lg p-2"
              >
                <div className="flex items-center justify-between">
                  {user.role === "INSTITUTION" &&
                    loggedInUser.id === user.id && (
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
                {/* <h3>{profess}</h3> */}
              </div>
            ))
          ) : (
            <h4>There are no faculty members</h4>
          )}
        </div>
      </div>
    </div>
  );
}
