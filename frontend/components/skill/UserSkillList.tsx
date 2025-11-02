"use client";

import { useSession } from "@/lib/auth-client";
import type { UserData, UserSkillData } from "@/types/types";
import SkillManager from "./SkillManager";

interface UserSkillListProps {
  skills: UserSkillData[];
  userId: string;
  currentUser: UserData;
  canEdit?: boolean;
  onSkillUpdated?: () => void;
}

export default function UserSkillList({
  skills,
  userId,
  currentUser,
  canEdit,
  onSkillUpdated,
}: UserSkillListProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Get endorsements for current user
  const currentUserEndorsements = skills
    .filter(
      (skill) => skill._count?.endorsements && skill._count.endorsements > 0
    )
    .map((skill) => skill.id);

  return (
    <SkillManager
      currentUser={currentUser}
      currentUserEndorsements={currentUserEndorsements}
      userId={userId}
    />
  );
}
