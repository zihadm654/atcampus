"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Course,
  Faculty,
  CourseStatus,
  SkillLevel,
} from "@prisma/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { courseSchema, TCourse } from "@/lib/validations/course";
import { createCourse, updateCourse } from "@/components/courses/actions";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import JobDescriptionEditor from "@/components/editor/richEditor";

interface CreateCourseFormProps {
  user?: User;
  course?: Course;
}

// Define new type for schools with faculties
interface SchoolWithFaculties {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  description?: string;
  logo?: string;
  coverPhoto?: string;
  website?: string;
  isActive: boolean;
  faculties: Array<{
    id: string;
    name: string;
    shortName?: string;
    slug: string;
    description?: string;
    logo?: string;
    coverPhoto?: string;
    website?: string;
    isActive: boolean;
  }>;
}

export function CreateCourseForm({ user, course }: CreateCourseFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<TCourse>({
    resolver: zodResolver(courseSchema),
    defaultValues: course
      ? {
          title: course.title || "",
          description: course.description || "",
          code: course.code || "",
          credits: course.credits || 3,
          difficulty: course.difficulty || SkillLevel.BEGINNER,
          estimatedHours: course.estimatedHours || 10,
          facultyId: course.facultyId || "",
          schoolId: course.schoolId || "",
          objectives: course.objectives || [],
          outcomes: course.outcomes || [],
          status: course.status || CourseStatus.DRAFT,
        }
      : {
          title: "",
          description: "",
          code: "",
          credits: 3,
          difficulty: "BEGINNER",
          estimatedHours: 10,
          facultyId: "",
          schoolId: "",
          objectives: [],
          outcomes: [],
          status: CourseStatus.DRAFT,
        },
  });
  const queryClient = useQueryClient();

  // State for selected school and faculty
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    course?.schoolId || ""
  );
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    course?.facultyId || ""
  );

  // Fetch schools with faculties using the unified API
  const {
    data: schools,
    isLoading: isLoadingSchools,
    error: schoolsError,
  } = useQuery<SchoolWithFaculties[]>({
    queryKey: ["user-schools-faculties"],
    queryFn: async () => {
      if (user?.role !== "PROFESSOR" && user?.role !== "INSTITUTION") {
        return [];
      }

      const res = await fetch("/api/user-schools-faculties");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Failed to fetch schools and faculties"
        );
      }
      return res.json();
    },
    enabled: user?.role === "PROFESSOR" || user?.role === "INSTITUTION",
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
  console.log(schools, "schools");
  // Derive faculties from selected school
  const schoolFaculties = React.useMemo(() => {
    if (!selectedSchoolId || !schools) return [];
    const selectedSchool = schools.find((s) => s.id === selectedSchoolId);
    return selectedSchool ? selectedSchool.faculties : [];
  }, [schools, selectedSchoolId]);

  // Remove the old faculties query as it's no longer needed
  // Effect to reset faculty when school changes
  useEffect(() => {
    if (selectedSchoolId) {
      setSelectedFacultyId("");
      form.setValue("facultyId", "");
    }
  }, [selectedSchoolId, form]);

  // Effect to set default values when editing a course
  useEffect(() => {
    if (course) {
      // Set the selected faculty and school
      setSelectedFacultyId(course.facultyId || "");
      setSelectedSchoolId(course.schoolId || "");
      form.setValue("facultyId", course.facultyId || "");
      form.setValue("schoolId", course.schoolId || "");
    }
  }, [course, form]);

  async function onSubmit(values: TCourse) {
    // For professors and institutions, use the selected faculty and school IDs from the state
    if (user?.role === "PROFESSOR" || user?.role === "INSTITUTION") {
      if (selectedFacultyId) {
        values.facultyId = selectedFacultyId;
      }
      if (selectedSchoolId) {
        values.schoolId = selectedSchoolId;
      }
    }

    if (course) {
      try {
        setPending(true);
        await updateCourse(values, course.id);
        toast.success("Course updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["course-feed"] });
        form.reset();
        router.push("/courses");
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setPending(false);
      }
    } else {
      try {
        setPending(true);
        const result = await createCourse(values);
        if (result.success) {
          const message =
            "Course created and submitted for approval successfully!";
          toast.success(message);
          queryClient.invalidateQueries({ queryKey: ["course-feed"] });
          form.reset();
          router.push("/courses");
        } else {
          toast.error(result.error || "Failed to create course");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setPending(false);
      }
    }
  }

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <form
        className="col-span-1 flex flex-col gap-8 lg:col-span-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {user?.role === "PROFESSOR" || user?.role === "INSTITUTION" ? (
              // Dynamic selection for professors and institutions based on their institution
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormItem>
                    <FormLabel>Select School</FormLabel>
                    <Select
                      value={selectedSchoolId}
                      onValueChange={(value) => {
                        setSelectedSchoolId(value);
                        setSelectedFacultyId("");
                        form.setValue("facultyId", "");
                        form.setValue("schoolId", value);
                      }}
                      disabled={isLoadingSchools || !!schoolsError}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingSchools
                              ? "Loading schools..."
                              : schoolsError
                                ? "Error loading schools"
                                : "Select a school"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {schoolsError && (
                          <SelectItem value="error" disabled>
                            Failed to load schools. Please refresh.
                          </SelectItem>
                        )}
                        {schools?.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                        {!isLoadingSchools && !schools?.length && (
                          <SelectItem value="empty" disabled>
                            No schools available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {schoolsError && (
                      <p className="text-sm text-destructive">
                        {schoolsError instanceof Error
                          ? schoolsError.message
                          : "Failed to load schools"}
                      </p>
                    )}
                  </FormItem>

                  <FormItem>
                    <FormLabel>Select Faculty</FormLabel>
                    <Select
                      value={selectedFacultyId}
                      onValueChange={(value) => {
                        setSelectedFacultyId(value);
                        form.setValue("facultyId", value);
                      }}
                      disabled={
                        !selectedSchoolId || isLoadingSchools || !!schoolsError
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedSchoolId
                              ? "Select a school first"
                              : isLoadingSchools
                                ? "Loading faculties..."
                                : schoolsError
                                  ? "Error loading faculties"
                                  : "Select a faculty"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {schoolsError && (
                          <SelectItem value="error" disabled>
                            Failed to load faculties. Please refresh.
                          </SelectItem>
                        )}
                        {schoolFaculties?.map((faculty) => (
                          <SelectItem key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </SelectItem>
                        ))}
                        {!isLoadingSchools &&
                          selectedSchoolId &&
                          !schoolFaculties?.length && (
                            <SelectItem value="empty" disabled>
                              No faculties available in this school
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
                    {schoolsError && (
                      <p className="text-sm text-destructive">
                        {schoolsError instanceof Error
                          ? schoolsError.message
                          : "Failed to load faculties"}
                      </p>
                    )}
                  </FormItem>
                </div>
              </>
            ) : (
              // Static selection for other roles (admins, etc.)
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="empty" disabled>
                            Contact admin to set up schools
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facultyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a faculty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="empty" disabled>
                            Contact admin to set up faculties
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Course Information Fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Course Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Course Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Credits"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours (weeks)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Estimated Hours"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(SkillLevel).map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={
                        user?.role === "PROFESSOR" &&
                        course?.status === CourseStatus.PUBLISHED
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {[CourseStatus.DRAFT, CourseStatus.UNDER_REVIEW].map(
                            (status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status
                                    .slice(1)
                                    .toLowerCase()
                                    .replace("_", " ")}
                                {user?.role === "PROFESSOR" &&
                                  status === CourseStatus.UNDER_REVIEW && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      (Submit for institution approval)
                                    </span>
                                  )}
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {user?.role === "PROFESSOR" && (
                      <p className="text-sm text-muted-foreground">
                        Professors can save courses as drafts or submit for
                        review. Institution approval is required before courses
                        can be published.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning Objectives</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter learning objectives separated by commas"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter((o) => o.length > 0)
                        )
                      }
                      value={field.value?.join(", ") || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outcomes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning Outcomes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter learning outcomes separated by commas"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter((o) => o.length > 0)
                        )
                      }
                      value={field.value?.join(", ") || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Description</FormLabel>
                  <FormControl>
                    <JobDescriptionEditor field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button className="flex-1" disabled={pending} type="submit">
            {pending
              ? "Saving..."
              : course
                ? "Update Course"
                : user?.role === "PROFESSOR" &&
                    form.watch("status") === CourseStatus.UNDER_REVIEW
                  ? "Submit for Approval"
                  : user?.role === "PROFESSOR"
                    ? "Save as Draft"
                    : "Save Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
