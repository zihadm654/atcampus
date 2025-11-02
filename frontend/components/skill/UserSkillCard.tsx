"use client";

import { SkillLevel } from "@prisma/client";
import { Clock, Edit, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const skillLevelColors = {
  [SkillLevel.BEGINNER]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  [SkillLevel.INTERMEDIATE]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  [SkillLevel.EXPERT]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

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

  // Get the skill level from the skill relationship
  const skillLevel = skill.skill?.difficulty || SkillLevel.BEGINNER;

  // Get years of experience from the skill relationship
  const yearsOfExperience = skill.skill?.yearsOfExperience || 0;

  return (
    <>
      <Card className="group transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-2">
                <h3 className="truncate font-medium text-lg">{skillName}</h3>
                <SkillEndorsementButton
                  isEndorsed={isEndorsed}
                  skill={skill}
                  userId={userId}
                />
              </div>

              <div className="flex flex-wrap gap-1">
                <Badge
                  className={skillLevelColors[skillLevel]}
                  variant="secondary"
                >
                  {skillLevel?.charAt(0) + skillLevel?.slice(1).toLowerCase()}
                </Badge>

                {yearsOfExperience > 0 && (
                  <Badge className="flex items-center gap-1" variant="outline">
                    <Clock className="h-3 w-3" />
                    {yearsOfExperience}{" "}
                    {yearsOfExperience === 1 ? "year" : "years"}
                  </Badge>
                )}

                {skill._count?.endorsements > 0 && (
                  <Badge
                    className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    variant="secondary"
                  >
                    <Star className="h-3 w-3" />
                    {skill._count.endorsements}
                  </Badge>
                )}
              </div>

              {skill._count?.endorsements > 0 && (
                <SkillEndorsementDialog skill={skill} />
              )}
            </div>

            {canEdit && (
              <div className="ml-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  className="h-8 w-8 p-0"
                  onClick={() => setShowEditDialog(true)}
                  size="sm"
                  title="Edit skill"
                  variant="ghost"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
