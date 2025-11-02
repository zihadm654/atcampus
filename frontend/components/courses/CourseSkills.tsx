"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Course {
  id: string;
  skills: string[];
}

interface CourseSkillsProps {
  courseId: string;
}

export default function CourseSkills({ courseId }: CourseSkillsProps) {
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch course");
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

  if (!course?.skills || course.skills.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teachable Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {course.skills.map((skill: string, index: number) => (
            <Badge key={`${skill}-${index}`} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
