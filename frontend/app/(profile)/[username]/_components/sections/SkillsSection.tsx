import React, { useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
  isLoading?: boolean;
  error?: Error | null;
  onSkillsUpdate?: () => void;
}

// Loading skeleton component
function SkillsSkeleton({
  showHeader = true,
  canEdit = false,
  className = "",
}: {
  showHeader?: boolean;
  canEdit?: boolean;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl border border-gray-100 shadow-sm animate-pulse",
        className
      )}
    >
      {showHeader && (
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center">
            <div className="w-7 h-7 bg-gray-200 rounded mr-2" />
            <div className="w-20 h-6 bg-gray-200 rounded" />
          </div>
          {canEdit && (
            <CardAction>
              <div className="h-8 w-20 bg-gray-200 rounded-md" />
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-1" : ""}>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Error state component
function SkillsError({
  showHeader = true,
  className = "",
  onRetry,
}: {
  showHeader?: boolean;
  className?: string;
  onRetry?: () => void;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl border border-gray-100 shadow-sm",
        className
      )}
    >
      {showHeader && (
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="flex items-center text-lg font-medium">
            <Icons.skill className="size-7 pr-2" />
            Skills
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-1" : ""}>
        <Alert variant="destructive" className="border-0">
          <Icons.warning className="h-4 w-4" />
          <div className="flex flex-col items-start gap-2">
            <AlertDescription>
              Failed to load skills. Please try refreshing the page.
            </AlertDescription>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-2"
              >
                <Icons.refresh className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Empty state component
function SkillsEmpty({
  canEdit = false,
  userId = "",
  onSkillsUpdate,
  showHeader = true,
  className = "",
}: {
  canEdit?: boolean;
  userId?: string;
  onSkillsUpdate?: () => void;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow",
        className
      )}
    >
      {showHeader && (
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="flex items-center text-lg font-medium">
            <Icons.skill className="size-7 pr-2" />
            Skills
          </CardTitle>
          {canEdit && (
            <CardAction>
              <SkillButton
                user={{ id: userId }}
                onSkillAdded={onSkillsUpdate}
              />
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-1" : ""}>
        <div className="flex h-28 items-center justify-center rounded-lg">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-gray-50 p-3 mb-2">
              <Icons.skill className="size-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              No skills added yet
            </p>
            {canEdit ? (
              <p className="text-xs text-gray-500 mt-1">
                Add your first skill to showcase your expertise
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                This user hasn't added any skills yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SkillsSection({
  userSkills,
  userId,
  canEdit,
  limit,
  showHeader = true,
  className = "",
  isLoading = false,
  error = null,
  onSkillsUpdate,
}: SkillsSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const displaySkills = useMemo(() => {
    const skills = limit && !showAll ? userSkills.slice(0, limit) : userSkills;
    return skills.map((skill) => ({
      ...skill,
      _count: { endorsements: skill._count?.endorsements || 0 },
      skillId: skill.id,
    })) as UserSkillData[];
  }, [userSkills, limit, showAll]);

  const hasMoreSkills = limit && userSkills.length > limit;
  const totalSkills = userSkills.length;

  if (isLoading) {
    return (
      <SkillsSkeleton
        showHeader={showHeader}
        canEdit={canEdit}
        className={className}
      />
    );
  }

  if (error) {
    return <SkillsError showHeader={showHeader} className={className} onRetry={onSkillsUpdate} />;
  }

  if (!userSkills || userSkills.length === 0) {
    return (
      <SkillsEmpty
        canEdit={canEdit}
        userId={userId}
        onSkillsUpdate={onSkillsUpdate}
        showHeader={showHeader}
        className={className}
      />
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow",
        className
      )}
    >
      {showHeader && (
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="flex items-center text-lg font-medium">
              <Icons.skill className="size-7 pr-2" />
              Skills
              <Badge variant="secondary" className="ml-2">
                {totalSkills}
              </Badge>
            </CardTitle>
          {canEdit && (
            <CardAction>
              <SkillButton
                user={{ id: userId }}
                onSkillAdded={onSkillsUpdate}
              />
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-1" : ""}>
        <div className="space-y-2">
          <UserSkillList
            skills={displaySkills}
            userId={userId}
            canEdit={canEdit}
            onSkillUpdated={onSkillsUpdate}
          />

          {hasMoreSkills && (
            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {showAll ? (
                  <>
                    <Icons.chevronUp className="mr-1 h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Icons.chevronDown className="mr-1 h-4 w-4" />
                    Show All ({userSkills.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
