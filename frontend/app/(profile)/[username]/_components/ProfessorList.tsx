"use client";

import { useQuery } from "@tanstack/react-query";
import { Icons } from "@/components/shared/icons";
import { getProfessorsForFaculty } from "./schoolActions";
import UserAvatar from "@/components/UserAvatar";

interface ProfessorListProps {
  facultyId: string;
}

export default function ProfessorList({ facultyId }: ProfessorListProps) {
  const { data: professors, isLoading } = useQuery({
    queryKey: ["professors", facultyId],
    queryFn: () => getProfessorsForFaculty(facultyId),
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="mt-2">
      <h5 className="text-sm font-medium text-muted-foreground mb-2">
        Professors:
      </h5>
      {professors && professors.length > 0 ? (
        <div className="space-y-2">
          {professors.map((professor) => (
            <div key={professor.id} className="flex items-center gap-2 text-sm">
              {/* <UserAvatar
                avatarUrl={professor.professor.}
                size={24}
                className="rounded-full"
              /> */}
              <span>{professor.title}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Icons.info className="h-4 w-4" />
          <span>No professors assigned</span>
        </div>
      )}
    </div>
  );
}
