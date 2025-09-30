"use client";

import { useState } from "react";
import { UserSkillData } from "@/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit, Trash2 } from "lucide-react";
import SkillEndorsementButton from "./SkillEndorsementButton";
import SkillEndorsementDialog from "./SkillEndorsementDialog";
import SkillDialog from "./SkillDialog";
import { SkillLevel } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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

  return (
    <>
      <Card className=" transition-all hover:shadow-md">
        <CardContent className="p-2">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="text-lg font-medium">{skill.title}</h3>
                <SkillEndorsementButton
                  skill={skill}
                  isEndorsed={isEndorsed}
                  userId={userId}
                />
              </div>

              <div className="flex flex-wrap gap-1">
                <Badge
                  variant="secondary"
                  className={skillLevelColors[skill.level]}
                >
                  {skill.level.charAt(0) + skill.level.slice(1).toLowerCase()}
                </Badge>

                {skill.yearsOfExperience > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {skill.yearsOfExperience}{" "}
                    {skill.yearsOfExperience === 1 ? "year" : "years"}
                  </Badge>
                )}
              </div>

              {skill._count?.endorsements > 0 && (
                <SkillEndorsementDialog skill={skill} />
              )}
            </div>

            {canEdit && (
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-60 hover:opacity-100 transition-opacity"
                  onClick={() => setShowEditDialog(true)}
                  title="Edit skill"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <SkillDialog
          skill={skill}
          user={session?.user as any}
          open={showEditDialog}
          onOpenChange={(open, success) => {
            setShowEditDialog(open);
            if (success && onSkillUpdated) {
              onSkillUpdated();
            }
          }}
        />
      )}
    </>
  );
}
