"use client";

import { useState } from "react";
import { Faculty, School } from "@prisma/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditFacultyDialog from "./EditFacultyDialog";
import ProfessorList from "./ProfessorList";

interface FacultyListProps {
  faculties: (Faculty & { school: School | null })[];
}

export default function FacultyList({ faculties }: FacultyListProps) {
  const [showEditFacultyDialog, setShowEditFacultyDialog] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<(Faculty & { school: School | null }) | undefined>(undefined);

  const handleEditClick = (faculty: (Faculty & { school: School | null })) => {
    setSelectedFaculty(faculty);
    setShowEditFacultyDialog(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faculties</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {faculties.length === 0 ? (
          <p className="text-muted-foreground">No faculties found.</p>
        ) : (
          faculties.map((faculty) => (
            <div
              key={faculty.id}
              className={cn(
                "mb-4 grid grid-cols-2 items-start pb-4 last:mb-0 last:pb-0",
              )}
            >
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {faculty.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {faculty.description}
                </p>
                <Button
                  variant="link"
                  onClick={() => handleEditClick(faculty)}
                  className="p-0 text-sm"
                >
                  Edit Faculty
                </Button>
                <ProfessorList facultyId={faculty.id} />
              </div>
            </div>
          ))
        )}
      </CardContent>
      <EditFacultyDialog
        faculty={selectedFaculty}
        open={showEditFacultyDialog}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFaculty(undefined);
          }
          setShowEditFacultyDialog(open);
        }}
      />
    </Card>
  );
}