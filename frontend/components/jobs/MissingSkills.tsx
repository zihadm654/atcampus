"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MissingSkillsProps {
  jobId: string;
}

export default function MissingSkills({ jobId }: MissingSkillsProps) {
  const {
    data: matchData,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["job-match", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/job-matches?jobId=${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job match");
      }
      return response.json();
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Show loading state
  if (isLoading || isFetching) {
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

  // Show error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills to Develop</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Error loading skills data
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show no data state
  if (!matchData?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills to Develop</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No skills data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const missingSkills = matchData.match.missingSkills || [];
  const missingCourses = matchData.match.missingCourses || [];

  // If no missing skills or courses, show a message instead of hiding the component
  if (missingSkills.length === 0 && missingCourses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills to Develop</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Great job! You have all the required skills and courses for this
            position.
          </p>
        </CardContent>
      </Card>
    );
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
