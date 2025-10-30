"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobMatch } from "@/hooks/use-job-match";

interface MissingSkillsProps {
  jobId: string;
}

export default function MissingSkills({ jobId }: MissingSkillsProps) {
  const { data: matchData, isLoading } = useJobMatch(jobId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills to Develop</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[...new Array(3)].map((_, i) => (
              <Badge key={i} variant="secondary">
                Loading...
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!matchData?.success) {
    return null;
  }

  const missingSkills = matchData.match.missingSkills || [];
  const missingCourses = matchData.match.missingCourses || [];

  // If no missing skills or courses, don't show the component
  if (missingSkills.length === 0 && missingCourses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills to Develop</CardTitle>
      </CardHeader>
      <CardContent>
        {missingSkills.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 font-medium">Missing Skills:</h3>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill: string, index: number) => (
                <Badge key={`skill-${index}`} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {missingCourses.length > 0 && (
          <div>
            <h3 className="mb-2 font-medium">Missing Courses:</h3>
            <div className="flex flex-wrap gap-2">
              {missingCourses.map((course: string, index: number) => (
                <Badge key={`course-${index}`} variant="outline">
                  {course}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
