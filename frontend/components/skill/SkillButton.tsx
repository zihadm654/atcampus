"use client";

import { useState } from "react";
import { UserData } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SkillDialog from "./SkillDialog";
import { Icons } from "@/components/shared/icons";

interface SkillButtonProps {
  user: UserData | { id: string };
  onSkillAdded?: () => void;
  disabled?: boolean;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  tooltip?: string;
  showIcon?: boolean;
}

export default function SkillButton({
  user,
  onSkillAdded,
  disabled = false,
  variant = "outline",
  size = "default",
  className,
  tooltip = "Add a new skill to your profile",
  showIcon = true,
}: SkillButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleDialogClose = (success: boolean) => {
    setShowDialog(false);
    if (success && onSkillAdded) {
      onSkillAdded();
    }
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      onClick={() => setShowDialog(true)}
      disabled={disabled}
      className={className}
      aria-label={tooltip}
      aria-haspopup="dialog"
      aria-expanded={showDialog}
    >
      {showIcon && <Icons.add className="mr-2 h-4 w-4" aria-hidden="true" />}
      Add Skill
    </Button>
  );

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="top" align="center">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SkillDialog
        skill={null}
        user={user as UserData}
        open={showDialog}
        onOpenChange={handleDialogClose}
      />
    </>
  );
}
