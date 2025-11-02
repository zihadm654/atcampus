"use client";

import { useState } from "react";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import type { UserData } from "@/types/types";
import SkillDialog from "./SkillDialog";
import UserSkillCard from "./UserSkillCard";
import { useSkills } from "./useSkills";

interface SkillManagerProps {
  userId: string;
  currentUser: UserData;
  currentUserEndorsements?: string[];
}

export default function SkillManager({
  userId,
  currentUser,
  currentUserEndorsements = [],
}: SkillManagerProps) {
  const {
    skills,
    isLoading,
    error,
    canEdit,
    isAdding,
    isUpdating,
    isDeleting,
  } = useSkills(userId);

  const [showAddDialog, setShowAddDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...new Array(3)].map((_, i) => (
          <div className="h-16 animate-pulse rounded-lg bg-gray-200" key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-red-600">
          Failed to load skills. Please try again later.
        </p>
      </div>
    );
  }

  // Check if any skill operation is in progress
  const isOperationPending = isAdding || isUpdating || isDeleting;

  return (
    <div className="space-y-4">
      {/* {canEdit && (
        <div className="flex justify-end">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={isOperationPending}
            onClick={() => setShowAddDialog(true)}
          >
            <Icons.add className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </div>
      )} */}

      {skills.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center">
          <Icons.skill className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 font-medium text-lg">No skills added yet</h3>
          <p className="mt-1 text-gray-500">
            {canEdit
              ? "Add your first skill to showcase your expertise."
              : "This user hasn't added any skills yet."}
          </p>
          {canEdit && (
            <Button
              className="mt-4"
              disabled={isOperationPending}
              onClick={() => setShowAddDialog(true)}
            >
              Add Your First Skill
            </Button>
          )}
        </div>
      ) : (
        <div className="grid max-h-40 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
          {skills.map((skill) => (
            <UserSkillCard
              canEdit={canEdit}
              currentUserEndorsements={currentUserEndorsements}
              key={skill.id}
              skill={skill}
              userId={userId}
            />
          ))}
        </div>
      )}

      {canEdit && (
        <SkillDialog
          onOpenChange={(open, success) => {
            setShowAddDialog(open);
          }}
          open={showAddDialog}
          user={currentUser}
        />
      )}
    </div>
  );
}
