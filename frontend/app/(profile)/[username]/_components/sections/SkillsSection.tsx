import { useMemo, useState } from "react";
import { Icons } from "@/components/shared/icons";
import SkillButton from "@/components/skill/SkillButton";
import UserSkillList from "@/components/skill/UserSkillList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserData, UserSkillData } from "@/types/types";

interface SkillsSectionProps {
  userSkills: any;
  userId: string;
  user: UserData;
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
        "animate-pulse overflow-hidden rounded-xl border border-gray-100 shadow-sm",
        className
      )}
    >
      {showHeader && (
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center">
            <div className="mr-2 h-7 w-7 rounded bg-gray-200" />
            <div className="h-6 w-20 rounded bg-gray-200" />
          </div>
          {canEdit && (
            <CardAction>
              <div className="h-8 w-20 rounded-md bg-gray-200" />
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-1" : ""}>
        <div className="space-y-2">
          {[...new Array(3)].map((_, i) => (
            <div className="flex items-center space-x-3" key={i}>
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
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
          <CardTitle className="flex items-center font-medium text-lg">
            <Icons.skill className="size-7 pr-2" />
            Skills
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-1" : ""}>
        <Alert className="border-0" variant="destructive">
          <Icons.warning className="h-4 w-4" />
          <div className="flex flex-col items-start gap-2">
            <AlertDescription>
              Failed to load skills. Please try refreshing the page.
            </AlertDescription>
            {onRetry && (
              <Button
                className="mt-2"
                onClick={onRetry}
                size="sm"
                variant="outline"
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
          <CardTitle className="flex items-center font-medium text-lg">
            <Icons.skill className="size-7 pr-2" />
            Skills
          </CardTitle>
          {canEdit && (
            <CardAction>
              <SkillButton
                onSkillAdded={onSkillsUpdate}
                user={{ id: userId }}
              />
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-1" : ""}>
        <div className="flex h-28 items-center justify-center rounded-lg">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 rounded-full bg-gray-50 p-3">
              <Icons.skill className="size-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900 text-sm">
              No skills added yet
            </p>
            {canEdit ? (
              <p className="mt-1 text-gray-500 text-xs">
                Add your first skill to showcase your expertise
              </p>
            ) : (
              <p className="mt-1 text-gray-500 text-xs">
                This user hasn't added any skills yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Category card component for grouped skills
function CategoryCard({
  category,
  skills,
  canEdit,
  userId,
  user,
  onSkillsUpdate,
}: {
  category: string;
  skills: UserSkillData[];
  canEdit: boolean;
  userId: string;
  user: UserData;
  onSkillsUpdate?: () => void;
}) {
  return (
    <Card className="py-2 transition-all hover:shadow gap-2">
      <CardHeader>
        <CardTitle className="flex items-center font-medium text-lg">
          {category || "Uncategorized"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UserSkillList
          canEdit={canEdit}
          currentUser={user}
          onSkillUpdated={onSkillsUpdate}
          skills={skills}
          userId={userId}
        />
      </CardContent>
    </Card>
  );
}

export default function SkillsSection({
  userSkills,
  userId,
  user,
  canEdit,
  limit,
  showHeader = true,
  className = "",
  isLoading = false,
  error = null,
  onSkillsUpdate,
}: SkillsSectionProps) {
  const [showAll, setShowAll] = useState(false);

  // Group skills by category
  const groupedSkills = useMemo(() => {
    if (!userSkills || userSkills.length === 0) return {};

    const grouped = userSkills.reduce((acc: Record<string, any[]>, skill: any) => {
      const category = skill.skill.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        ...skill,
        _count: { endorsements: skill._count?.endorsements || 0 },
        skillId: skill.id,
        skill: {
          name: skill.skill.name,
          category: skill.skill.category,
          yearsOfExperience: skill.yearsOfExperience || 0,
          difficulty: skill.difficulty || "BEGINNER",
        },
      });
      return acc;
    }, {} as Record<string, any[]>);

    return grouped;
  }, [userSkills]);

  // Get all categories
  const categories = useMemo(() => {
    return Object.keys(groupedSkills).sort();
  }, [groupedSkills]);

  // Limit skills per category if needed
  const displayCategories = useMemo(() => {
    if (!limit || showAll) return categories;

    // Take only first few categories based on limit
    return categories.slice(0, limit);
  }, [categories, limit, showAll]);

  const totalSkills = userSkills?.length || 0;
  const hasMoreCategories = limit && categories.length > limit;

  if (isLoading) {
    return (
      <SkillsSkeleton
        canEdit={canEdit}
        className={className}
        showHeader={showHeader}
      />
    );
  }

  if (error) {
    return (
      <SkillsError
        className={className}
        onRetry={onSkillsUpdate}
        showHeader={showHeader}
      />
    );
  }

  if (!userSkills || userSkills.length === 0) {
    return (
      <SkillsEmpty
        canEdit={canEdit}
        className={className}
        onSkillsUpdate={onSkillsUpdate}
        showHeader={showHeader}
        userId={userId}
      />
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Skills</h3>
          {canEdit && (
            <SkillButton
              onSkillAdded={onSkillsUpdate}
              user={{ id: userId }}
            />
          )}
        </div>
      )}

      <div className="max-h-dvh overflow-y-auto grid gap-2">
        {displayCategories.map((category) => (
          <CategoryCard
            key={category}
            canEdit={canEdit}
            category={category}
            onSkillsUpdate={onSkillsUpdate}
            skills={groupedSkills[category]}
            user={user}
            userId={userId}
          />
        ))}
      </div>

      {hasMoreCategories && (
        <div className="pt-2 text-center">
          <Button
            className="text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
            onClick={() => setShowAll(!showAll)}
            size="sm"
            variant="ghost"
          >
            {showAll ? (
              <>
                <Icons.chevronUp className="mr-1 h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <Icons.chevronDown className="mr-1 h-4 w-4" />
                Show All Categories ({categories.length})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}