"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface JobMatchScoreProps {
  jobId: string;
}

export default function JobMatchScore({ jobId }: JobMatchScoreProps) {
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
          <CardTitle>Job Match Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-4 animate-pulse rounded bg-gray-200" />
        </CardContent>
      </Card>
    );
  }

  // Show error or no data state
  if (error || !matchData?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Match Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {error ? "Error loading match data" : "No match data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const match = matchData.match;
  const overallPercentage = Math.round(match.matchPercentage);
  const skillPercentage = Math.round(match.skillMatchPercentage);
  const coursePercentage = Math.round(match.courseMatchPercentage);

  // Determine color based on overall match
  let progressColor = "bg-red-500";
  if (overallPercentage >= 80) {
    progressColor = "bg-green-500";
  } else if (overallPercentage >= 60) {
    progressColor = "bg-yellow-500";
  } else if (overallPercentage >= 40) {
    progressColor = "bg-orange-500";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Match Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between">
              <span className="font-medium">Overall Match</span>
              <span className="font-bold">{overallPercentage}%</span>
            </div>
            <Progress
              className={`w-full ${progressColor}`}
              value={overallPercentage}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Skills</span>
                <span>{skillPercentage}%</span>
              </div>
              <Progress className="h-2" value={skillPercentage} />
              <div className="mt-1 text-muted-foreground text-xs">
                {match.matchedSkills} of {match.requiredSkills} skills matched
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Courses</span>
                <span>{coursePercentage}%</span>
              </div>
              <Progress className="h-2" value={coursePercentage} />
              <div className="mt-1 text-muted-foreground text-xs">
                {match.matchedCourses} of {match.requiredCourses} courses
                matched
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
