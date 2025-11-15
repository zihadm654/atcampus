"use client";

import { Edit } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import type { UserSkillData } from "@/types/types";
import SkillDialog from "./SkillDialog";
import SkillEndorsementButton from "./SkillEndorsementButton";
import SkillEndorsementDialog from "./SkillEndorsementDialog";

interface UserSkillCardProps {
  skill: UserSkillData;
  userId: string;
  currentUserEndorsements?: string[];
  canEdit?: boolean;
  onSkillUpdated?: () => void;
}

// const skillLevelColors = {
//   [SkillLevel.BEGINNER]:
//     "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
//   [SkillLevel.INTERMEDIATE]:
//     "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
//   [SkillLevel.EXPERT]:
//     "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
// };

export default function UserSkillCard({
  skill,
  userId,
  currentUserEndorsements = [],
  canEdit = false,
  onSkillUpdated,
}: UserSkillCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: session } = useSession();
  const isEndorsed = currentUserEndorsements.includes(skill.id);
  const isOwnProfile = session?.user?.id === userId;

  // Get the skill name from the skill relationship
  const skillName = skill.skill?.name || "Unknown Skill";

  return (
    <>
      <div className="flex items-center justify-start gap-2">
        <div className="flex items-start gap-2">
          <Badge>{skillName}</Badge>
          <SkillEndorsementButton
            isEndorsed={isEndorsed}
            skill={skill}
            userId={userId}
          />
        </div>
        {skill._count?.endorsements > 0 && (
          <SkillEndorsementDialog skill={skill} />
        )}
      </div>

      {canEdit && (
        <Button
          className="h-8 w-8 p-0"
          onClick={() => setShowEditDialog(true)}
          size="sm"
          title="Edit skill"
          variant="ghost"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}

      {canEdit && (
        <SkillDialog
          onOpenChange={(open, success) => {
            setShowEditDialog(open);
            if (success && onSkillUpdated) {
              onSkillUpdated();
            }
          }}
          open={showEditDialog}
          skill={skill}
          user={session?.user as any}
        />
      )}
    </>
  );
}
