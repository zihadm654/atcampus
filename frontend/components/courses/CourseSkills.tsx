"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CourseSkill {
  id: string;
  courseId: string;
  skillId: string;
  skill: {
    id: string;
    name: string;
    category: string | null;
  };
}

interface CourseSkillsProps {
  courseId: string;
}

export default function CourseSkills({ courseId }: CourseSkillsProps) {
  const { data: courseSkills, isLoading } = useQuery({
    queryKey: ["course-skills", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/skills`);
      if (!response.ok) {
        throw new Error("Failed to fetch course skills");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teachable Skills</CardTitle>
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

  if (!courseSkills || courseSkills.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teachable Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {courseSkills.map((courseSkill: CourseSkill) => (
            <Badge key={courseSkill.id} variant="secondary">
              {courseSkill.skill.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
