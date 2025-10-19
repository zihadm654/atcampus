"use client";

import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth-client";
import type { UserSkillData } from "@/types/types";

import {
  useEndorseSkillMutation,
  useRemoveEndorsementMutation,
} from "./endorsement.mutations";

interface SkillEndorsementButtonProps {
  skill: UserSkillData;
  isEndorsed?: boolean;
  disabled?: boolean;
  userId: string;
}

export default function SkillEndorsementButton({
  skill,
  isEndorsed = false,
  disabled = false,
  userId,
}: SkillEndorsementButtonProps) {
  const [endorsed, setEndorsed] = useState(isEndorsed);
  const endorseMutation = useEndorseSkillMutation();
  const removeEndorsementMutation = useRemoveEndorsementMutation();
  const { data: session } = useSession();

  // Don't show the button if viewing own profile
  if (session?.user?.id === userId) {
    return null;
  }

  const handleEndorsement = () => {
    if (endorsed) {
      removeEndorsementMutation.mutate(skill.id, {
        onSuccess: () => setEndorsed(false),
      });
    } else {
      endorseMutation.mutate(
        { userSkillId: skill.id, skillId: skill.skillId },
        {
          onSuccess: () => setEndorsed(true),
        }
      );
    }
  };

  const endorsementCount = skill._count?.endorsements || 0;
  const isLoading =
    endorseMutation.isPending || removeEndorsementMutation.isPending;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="ml-2 h-7 gap-1 rounded-full px-2"
            disabled={disabled || isLoading}
            onClick={handleEndorsement}
            size="sm"
            variant={endorsed ? "default" : "outline"}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {endorsementCount > 0 && (
              <span className="text-xs">{endorsementCount}</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{endorsed ? "Remove endorsement" : "Endorse this skill"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
