"use client";

import { useEffect, useState } from "react";

import { UserSkillData } from "@/types/types";
import { useSession } from "@/lib/auth-client";

import { getSkillEndorsements } from "./endorsement.actions";
import UserSkillCard from "./UserSkillCard";

interface UserSkillListProps {
  skills: UserSkillData[];
  userId: string;
  canEdit?: boolean;
  onSkillUpdated?: () => void;
}

export default function UserSkillList({
  skills,
  userId,
  canEdit,
  onSkillUpdated,
}: UserSkillListProps) {
  const { data: session } = useSession();
  const [endorsedSkillIds, setEndorsedSkillIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user's endorsements
  useEffect(() => {
    const fetchEndorsements = async () => {
      if (!session?.user?.id || session.user.id === userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Get all endorsements for each skill
        const endorsedIds: string[] = [];

        for (const skill of skills) {
          const endorsements = await getSkillEndorsements(skill.id);
          const hasEndorsed = endorsements.some(
            (e) => e.endorserId === session.user?.id
          );

          if (hasEndorsed) {
            endorsedIds.push(skill.id);
          }
        }

        setEndorsedSkillIds(endorsedIds);
      } catch (error) {
        console.error("Error fetching endorsements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEndorsements();
  }, [skills, session?.user?.id, userId]);

  if (skills.length === 0) {
    return (
      <div className="text-muted-foreground py-6 text-center">
        No skills added yet
      </div>
    );
  }

  return (
    <div className="space-y-1 grid grid-cols-2 max-md:grid-cols-1 gap-1 overflow-y-scroll max-h-48">
      {skills.map((skill) => (
        <UserSkillCard
          key={skill.id}
          skill={skill}
          userId={userId}
          currentUserEndorsements={endorsedSkillIds}
          canEdit={canEdit}
          onSkillUpdated={onSkillUpdated}
        />
      ))}
    </div>
  );
}
