import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import SkillButton from "@/components/skill/SkillButton";
import UserSkillList from "@/components/skill/UserSkillList";
import { UserSkillData } from "@/types/types";

interface UserSkill {
  id: string;
  title: string;
  level: string;
  yearsOfExperience?: number;
  skill: {
    name: string;
    category: string | null;
  };
  _count: {
    endorsements: number;
  };
}

interface SkillsSectionProps {
  userSkills: UserSkill[];
  userId: string;
  canEdit: boolean;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export default function SkillsSection({
  userSkills,
  userId,
  canEdit,
  limit,
  showHeader = true,
  className = "",
}: SkillsSectionProps) {
  const displaySkills = limit ? userSkills.slice(0, limit) : userSkills;
  const hasMoreSkills = limit && userSkills.length > limit;

  return (
    <Card className={`overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow ${className}`}>
      {showHeader && (
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="flex items-center text-lg font-medium">
            <Icons.skill className="size-7 pr-2" />
            Skills
            {hasMoreSkills && (
              <span className="ml-2 text-sm text-gray-500">
                (+{userSkills.length - limit!} more)
              </span>
            )}
          </CardTitle>
          {canEdit && (
            <CardAction>
              <SkillButton user={{ id: userId }} />
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-1" : ""}>
        {displaySkills.length > 0 ? (
          <div className="max-h-40 overflow-y-auto">
            <UserSkillList
              skills={displaySkills.map((skill) => ({
                ...skill,
                _count: { endorsements: skill._count?.endorsements || 0 },
                skillId: skill.id,
                level: skill.level as any,
                skill: {
                  name: skill.skill?.name || "",
                  category: skill.skill?.category || null
                },
                yearsOfExperience: skill.yearsOfExperience || 0,
              })) as UserSkillData[]}
              userId={userId}
            />
          </div>
        ) : (
          <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
            <div className="flex flex-col items-center">
              <Icons.skill className="size-10" />
              <p className="text-sm mt-2">No skills added yet</p>
              {canEdit && (
                <p className="text-xs text-gray-400 mt-1">
                  Add skills to showcase your expertise
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}