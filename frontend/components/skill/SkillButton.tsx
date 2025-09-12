"use client";

import { useState } from "react";

import { UserData } from "@/types/types";
import { Button } from "@/components/ui/button";

import SkillDialog from "./SkillDialog";

interface SkillButtonProps {
  user: UserData | { id: string };
}

export default function SkillButton({ user }: SkillButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        Add Skill
      </Button>
      <SkillDialog
        skill={null}
        user={user as UserData}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}