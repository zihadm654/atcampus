"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";

import { UserSkillData } from "@/types/types";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        },
      );
    }
  };

  const endorsementCount = skill._count?.skillEndorsements || 0;
  const isLoading =
    endorseMutation.isPending || removeEndorsementMutation.isPending;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={endorsed ? "default" : "outline"}
            size="sm"
            className="ml-2 h-7 gap-1 rounded-full px-2"
            onClick={handleEndorsement}
            disabled={disabled || isLoading}
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
