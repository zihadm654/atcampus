"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Job {
  id: string;
  skills: string[];
}

interface JobSkillsProps {
  jobId: string;
}

export default function JobSkills({ jobId }: JobSkillsProps) {
  const { data: job, isLoading } = useQuery<Job>({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Required Skills</CardTitle>
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

  if (!job?.skills || job.skills.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill: string, index: number) => (
            <Badge key={`${skill}-${index}`} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
