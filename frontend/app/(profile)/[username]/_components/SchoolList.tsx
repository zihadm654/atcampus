"use client";
import React from 'react';

import { useState } from "react";
import { School, Faculty } from "@prisma/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditSchoolDialog from "./EditSchoolDialog";

interface SchoolListProps {
  schools: (School & { faculties: Faculty[] })[];
}

export default function SchoolList({ schools }: SchoolListProps) {
  const [showEditSchoolDialog, setShowEditSchoolDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<(School & { faculties: Faculty[] }) | undefined>(undefined);

  const handleEditClick = (school: (School & { faculties: Faculty[] })) => {
    setSelectedSchool(school);
    setShowEditSchoolDialog(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schools</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {schools.length === 0 ? (
          <p className="text-muted-foreground">No schools found.</p>
        ) : (
          schools.map((school) => (
            <div
              key={school.id}
              className={cn(
                "mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0",
              )}
            >
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {school.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {school.description}
                </p>
                <Button
                  variant="link"
                  onClick={() => handleEditClick(school)}
                  className="p-0 text-sm"
                >
                  Edit School
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
      <EditSchoolDialog
        school={selectedSchool}
        open={showEditSchoolDialog}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSchool(undefined);
          }
          setShowEditSchoolDialog(open);
        }}
      />
    </Card>
  );
}