"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { Users, BookOpen, GraduationCap } from "lucide-react";

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
    faculty.members?.filter((member) => member.role === "member").length || 0;
  const courseCount = faculty._count?.courses || faculty.courses?.length || 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Faculty Header */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {faculty.coverPhoto && (
          <Image
            src={faculty.coverPhoto}
            alt={`${faculty.name} Cover`}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Faculty Logo */}
        {faculty.logo && (
          <div className="absolute bottom-4 left-4">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm">
              <Image
                src={faculty.logo}
                alt={`${faculty.name} Logo`}
                fill
                className="object-contain p-1"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (onEdit || onDelete) && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                  title="Edit Faculty"
                >
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 rounded-md bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm transition-colors"
                  title="Delete Faculty"
                >
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
            href={`/${username}/${schoolId}/${faculty.id}`}
            className="group-hover:text-primary transition-colors"
          >
            <h3 className="text-xl font-semibold mb-1">{faculty.name}</h3>
          </Link>
          {faculty?.shortName && (
            <p className="text-sm text-muted-foreground">{faculty.shortName}</p>
          )}
        </div>

        {/* Description */}
        {faculty.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
            {faculty.description}
          </p>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-lg font-semibold">{memberCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <span className="text-lg font-semibold">{professorCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Professors</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span className="text-lg font-semibold">{courseCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Courses</p>
          </div>
        </div>

        {/* Recent Members Preview */}
        {faculty.members && faculty.members.length > 0 && (
          <div className="border-t space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recent Members
            </h4>
            <div className="flex items-center space-x-2">
              {faculty.members.slice(0, 5).map((member) => (
                <Avatar
                  key={member.id}
                  className="h-8 w-8 border-2 border-background"
                >
                  <AvatarImage src={member.user.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {member.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {faculty.members.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">
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
            <Badge variant="destructive" className="text-xs">
              Inactive
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
