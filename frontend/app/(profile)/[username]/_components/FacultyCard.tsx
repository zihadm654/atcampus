"use client";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface FacultyCardProps {
  faculty: any;
  username: string;
  schoolId: string;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function FacultyCard({
  faculty,
  username,
  schoolId,
  showActions = false,
  onEdit,
  onDelete,
}: FacultyCardProps) {
  const memberCount = faculty._count?.members || faculty.members?.length || 0;
  const professorCount =
    faculty.members?.filter((member: any) => member.role === "member").length ||
    0;
  const courseCount = faculty._count?.courses || faculty.courses?.length || 0;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg pt-0">
      {/* Faculty Header */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {faculty.coverPhoto && (
          <Image
            alt={`${faculty.name} Cover`}
            className="object-cover"
            fill
            src={faculty.coverPhoto}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Faculty Logo */}
        {faculty.logo && (
          <div className="absolute bottom-4 left-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white/20 backdrop-blur-sm">
              <Image
                alt={`${faculty.name} Logo`}
                className="object-contain p-1"
                fill
                src={faculty.logo}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (onEdit || onDelete) && (
          <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex gap-1">
              {onEdit && (
                <button
                  className="rounded-md bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
                  onClick={onEdit}
                  title="Edit Faculty"
                  type="button"
                >
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  className="rounded-md bg-red-500/20 p-2 backdrop-blur-sm transition-colors hover:bg-red-500/30"
                  onClick={onDelete}
                  title="Delete Faculty"
                  type="button"
                >
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-2">
        {/* Faculty Name and Short Name */}
        <div className="mb-2">
          {/* <h3>{faculty.courses?.instructor.name}</h3> */}
          <Link
            className="transition-colors group-hover:text-primary"
            href={`/${username}/${schoolId}/${faculty.id}`}
          >
            <h3 className="mb-1 font-semibold text-xl">{faculty.name}</h3>
          </Link>
          {faculty?.shortName && (
            <p className="text-muted-foreground text-sm">{faculty.shortName}</p>
          )}
        </div>

        {/* Description */}
        {faculty.description && (
          <p className="mb-2 line-clamp-3 text-muted-foreground text-sm">
            {faculty.description}
          </p>
        )}

        {/* Statistics */}
        <div className="mb-2 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-lg">{memberCount}</span>
            </div>
            <p className="text-muted-foreground text-xs">Members</p>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-lg">{professorCount}</span>
            </div>
            <p className="text-muted-foreground text-xs">Professors</p>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-lg">{courseCount}</span>
            </div>
            <p className="text-muted-foreground text-xs">Courses</p>
          </div>
        </div>

        {/* Recent Members Preview */}
        {faculty.members && faculty.members.length > 0 && (
          <div className="space-y-2 border-t">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Users className="h-4 w-4" />
              Recent Members
            </h4>
            <div className="flex items-center space-x-2">
              {faculty.members.slice(0, 5).map((member: any) => (
                <Avatar
                  className="h-8 w-8 border-2 border-background"
                  key={member.id}
                >
                  <AvatarImage src={member.user.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {member.user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {faculty.members.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted">
                  <span className="font-medium text-xs">
                    +{faculty.members.length - 5}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Badge */}
        {!faculty.isActive && (
          <div className="mt-4">
            <Badge className="text-xs" variant="destructive">
              Inactive
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
