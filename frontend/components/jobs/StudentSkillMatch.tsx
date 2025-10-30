"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobMatch } from "@/hooks/use-job-match";
import { useSession } from "@/lib/auth-client";

interface StudentSkillMatchProps {
  jobId: string;
}

export default function StudentSkillMatch({ jobId }: StudentSkillMatchProps) {
  const { data: session } = useSession();
  const user = session?.user;

  // Only show this component for students
  if (user?.role !== "STUDENT") {
    return null;
  }

  const { data: matchData, isLoading } = useJobMatch(jobId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Skill Match</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...new Array(3)].map((_, i) => (
              <div className="flex items-center justify-between" key={i}>
                <Badge variant="secondary">Loading...</Badge>
                <div className="h-4 w-4 rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!matchData?.success) {
    return null;
  }

  const match = matchData.match;
  const skillMatchPercentage = Math.round(match.skillMatchPercentage);

  // Determine color based on skill match
  let progressColor = "bg-red-500";
  if (skillMatchPercentage >= 80) {
    progressColor = "bg-green-500";
  } else if (skillMatchPercentage >= 60) {
    progressColor = "bg-yellow-500";
  } else if (skillMatchPercentage >= 40) {
    progressColor = "bg-orange-500";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Skill Match</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Skill Match Percentage</span>
            <span className="font-bold text-lg">{skillMatchPercentage}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full ${progressColor}`}
              style={{ width: `${skillMatchPercentage}%` }}
            />
          </div>
          <div className="mt-1 text-muted-foreground text-sm">
            {match.matchedSkills} of {match.requiredSkills} required skills
            matched
          </div>
        </div>

        {/* Show missing skills if any */}
        {match.missingSkills && match.missingSkills.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 font-medium">Skills to Develop:</h3>
            <div className="flex flex-wrap gap-2">
              {match.missingSkills.map((skill: string, index: number) => (
                <Badge key={`missing-${index}`} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
