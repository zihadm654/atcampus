"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrganizationJobSkillsProps {
  jobId: string;
}

export default function OrganizationJobSkills({
  jobId,
}: OrganizationJobSkillsProps) {
  const { data: jobSkills, isLoading } = useQuery({
    queryKey: ["job-skills", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/skills`);
      if (!response.ok) {
        throw new Error("Failed to fetch job skills");
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

  if (!jobSkills || jobSkills.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {jobSkills.map((jobSkill: any) => (
            <Badge key={jobSkill.id} variant="secondary">
              {jobSkill.skill.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
