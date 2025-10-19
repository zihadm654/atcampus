"use client";

import { useQuery } from "@tanstack/react-query";
import { Icons } from "@/components/shared/icons";
import { getProfessorsForFaculty } from "./schoolActions";

interface ProfessorListProps {
  facultyId: string;
}

export default function ProfessorList({ facultyId }: ProfessorListProps) {
  const { data: professors, isLoading } = useQuery({
    queryKey: ["professors", facultyId],
    queryFn: () => getProfessorsForFaculty(facultyId),
  });

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="mt-2">
      <h5 className="mb-2 font-medium text-muted-foreground text-sm">
        Professors:
      </h5>
      {professors && professors.length > 0 ? (
        <div className="space-y-2">
          {professors.map((professor) => (
            <div className="flex items-center gap-2 text-sm" key={professor.id}>
              {/* <UserAvatar
                avatarUrl={professor.professor.}
                size={24}
                className="rounded-full"
              /> */}
              <span>{professor.user.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Icons.info className="h-4 w-4" />
          <span>No professors assigned</span>
        </div>
      )}
    </div>
  );
}
