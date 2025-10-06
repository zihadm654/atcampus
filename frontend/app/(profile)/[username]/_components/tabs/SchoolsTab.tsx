"use client";
import React, { useMemo } from "react";
import { EllipsisVertical, Ellipsis } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserData } from "@/types/types";
import AddSchoolDialog from "./AddSchoolDialog";
import EditSchoolDialog from "./EditSchoolDialog";
import DeleteSchoolDialog from "./DeleteSchoolDialog";
import AddFacultyDialog from "./AddFacultyDialog";
import EditFacultyDialog from "./EditFacultyDialog";
import DeleteFacultyDialog from "./DeleteFacultyDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/validations/auth";

export interface Faculty {
  id: string;
  name: string;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  // description: string| undefined;
  faculties: Faculty[];
}

interface SchoolsTabProps {
  user: UserData;
  isCurrentUser: boolean;
}

const SchoolManagement = ({ school, user }: { school: School; user: any }) => {
  const router = useRouter();
  return (
    <Card className="my-2">
      <CardHeader>
        <CardTitle
          className="text-xl hover:cursor-pointer"
          onClick={() => router.push(`/${user.username}/${school.id}`)}
        >
          {school.name}
        </CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center">
              <EllipsisVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <EditSchoolDialog school={school} />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DeleteSchoolDialog schoolId={school.id} />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AddFacultyDialog schoolId={school.id} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent>
        {school.faculties.map((faculty) => (
          <div className="flex items-center justify-between" key={faculty.id}>
            <h4>{faculty.name}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Ellipsis className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <EditFacultyDialog faculty={faculty} />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DeleteFacultyDialog facultyId={faculty.id} />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AddFacultyDialog schoolId={school.id} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default function SchoolsTab({ user, isCurrentUser }: SchoolsTabProps) {
  const canManage = useMemo(() => {
    return isCurrentUser && user.role === UserRole.INSTITUTION;
  }, [isCurrentUser, user.role]);

  // For institutions, show created schools
  if (user.role === UserRole.INSTITUTION) {
    // if (!canManage) {
    //   return (
    //     <div className="p-4 text-center text-gray-500">
    //       This section is only available to the institution administration.
    //     </div>
    //   );
    // }

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Academic Structure</CardTitle>
            <AddSchoolDialog />
          </div>
        </CardHeader>
        <CardContent className="grid lg:grid-cols-2 gap-2">
          {user.schools && user.schools.length > 0 ? (
            user.schools.map((school) => (
              <SchoolManagement key={school.id} school={school} user={user} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No schools created yet.</p>
              <p className="text-sm text-gray-400 mt-2">Create your first school to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // For other roles (ADMIN), show a different view
  if (user.role === UserRole.ADMIN) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Institution Schools</CardTitle>
        </CardHeader>
        <CardContent>
          {user.schools && user.schools.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-2">
              {user.schools.map((school) => (
                <div key={school.id} className="border p-4 rounded-lg">
                  <h3 className="font-semibold">{school.name}</h3>
                  <p className="text-sm text-gray-500">
                    {school.faculties.length} faculties
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No schools available.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // For other roles, show a generic message
  return (
    <div className="p-4 text-center text-gray-500">
      School information is not applicable for this user role.
    </div>
  );
}