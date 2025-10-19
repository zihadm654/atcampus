"use client";

import { useState } from "react";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UserData } from "@/types/types";
import SkillDialog from "./SkillDialog";

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
      aria-expanded={showDialog}
      aria-haspopup="dialog"
      aria-label={tooltip}
      className={className}
      disabled={disabled}
      onClick={() => setShowDialog(true)}
      size={size}
      variant={variant}
    >
      {showIcon && <Icons.add aria-hidden="true" className="mr-2 h-4 w-4" />}
      Add Skill
    </Button>
  );

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent align="center" side="top">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SkillDialog
        onOpenChange={handleDialogClose}
        open={showDialog}
        skill={null}
        user={user as UserData}
      />
    </>
  );
}
