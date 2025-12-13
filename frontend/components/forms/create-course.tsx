"use client";

import { CourseStatus, SkillLevel } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateCourseSkills } from "@/actions/job-matches";
import { createCourse, updateCourse } from "@/components/courses/actions";
import JobDescriptionEditor from "@/components/editor/richEditor";
import { type Course as ConfigCourse, coursesData } from "@/config/course";
import { courseSchema, type TCourse } from "@/lib/validations/course";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import MultipleSelector, { type Option } from "../ui/multi-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadButton } from "@/lib/uploadthing";

interface CreateCourseFormProps {
  user?: any;
  course?: any;
}

// Define types for schools and faculties
interface SchoolData {
  id: string;
  name: string;
  shortName?: string | null;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverPhoto?: string | null;
  website?: string | null;
  isActive: boolean;
  institutionId: string;
  createdAt: Date;
  updatedAt: Date;
  faculties: FacultyData[];
}

interface FacultyData {
  id: string;
  name: string;
  shortName?: string | null;
  slug: string;
  description?: string | null;
  isActive: boolean;
}

export function CreateCourseForm({ user, course }: CreateCourseFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<TCourse>({
    resolver: zodResolver(courseSchema),
    defaultValues: course
      ? {
          title: course.title || "",
          description: course.description || "",
          code: course.code || "",
          image: course.image || "",
          credits: course.credits || 3,
          difficulty: course.difficulty || "BEGINNER",
          estimatedHours: course.estimatedHours || 10,
          facultyId: course.facultyId || "",
          schoolId: course.schoolId || "",
          objectives: course.objectives || "",
          // Remove outcomes since it doesn't exist in the model
          status: course.status || CourseStatus.DRAFT,
          skills: course.skills || [], // Initialize with existing course skills if editing
        }
      : {
          title: "",
          description: "",
          code: "",
          image: "",
          credits: 3,
          difficulty: "BEGINNER",
          estimatedHours: 10,
          facultyId: "",
          schoolId: "",
          objectives: "",
          // Remove outcomes since it doesn't exist in the model
          status: CourseStatus.DRAFT,
          skills: [], // Initialize skills as empty array
        },
  });

  // Fetch schools with TanStack Query
  const { data: schoolsData, isLoading: loadingSchools } = useQuery({
    queryKey: ["user-schools-faculties"],
    queryFn: async () => {
      const response = await fetch("/api/user-schools-faculties");
      if (!response.ok) {
        throw new Error("Failed to fetch schools");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get faculties for selected school
  const selectedSchoolId = form.watch("schoolId");
  const selectedFacultyId = form.watch("facultyId");

  const selectedSchool = schoolsData?.find(
    (school: SchoolData) => school.id === selectedSchoolId,
  );
  const faculties = selectedSchool?.faculties || [];

  // Find matching faculty in coursesData
  const selectedFaculty = selectedFacultyId
    ? faculties.find((faculty: FacultyData) => faculty.id === selectedFacultyId)
    : null;

  // Find courses from config that match the selected faculty
  const [availableCourses, setAvailableCourses] = useState<ConfigCourse[]>([]);
  const [facultySkillOptions, setFacultySkillOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (selectedFaculty) {
      // Find matching faculty in coursesData using exact name match
      const matchingFaculty = coursesData.schools
        .flatMap((school) => school.faculties)
        .find((faculty) => faculty.name === selectedFaculty.name);

      if (matchingFaculty) {
        setAvailableCourses(matchingFaculty.courses);

        // Set faculty skills as options if they exist
        if (matchingFaculty.skills && matchingFaculty.skills.length > 0) {
          const skillOptions = matchingFaculty.skills.map((skill) => ({
            label: skill,
            value: skill,
          }));
          setFacultySkillOptions(skillOptions);
        } else {
          // No skills defined for this faculty
          setFacultySkillOptions([]);
        }
      } else {
        setAvailableCourses([]);
        setFacultySkillOptions([]);
      }
    } else {
      setAvailableCourses([]);
      setFacultySkillOptions([]);
    }
  }, [selectedFaculty]);

  // Auto-fill course code and title when a course is selected
  const handleCourseSelect = (courseCode: string) => {
    const selectedCourse = availableCourses.find(
      (course) => course.code === courseCode,
    );
    if (selectedCourse) {
      form.setValue("title", selectedCourse.name);
      form.setValue("code", courseCode);
    }
  };

  async function onSubmit(values: TCourse) {
    if (course) {
      try {
        setPending(true);
        await updateCourse(values, course.id);

        // Update course skills
        const selectedSkills = form.getValues("skills");
        if (selectedSkills && selectedSkills.length > 0) {
          await updateCourseSkills(course.id, selectedSkills);
        }

        toast.success("Course updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["course-feed"] });
        form.reset();
        router.push("/courses");
      } catch (error) {
        console.error(error);
        // Check if it's a Prisma unique constraint error
        if (
          error instanceof Error &&
          error.message.includes("already exists")
        ) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } finally {
        setPending(false);
      }
    } else {
      try {
        setPending(true);
        const result = await createCourse(values);
        if (result.success && result.data?.id) {
          // Update course skills
          const selectedSkills = form.getValues("skills");
          if (selectedSkills && selectedSkills.length > 0) {
            await updateCourseSkills(result.data.id, selectedSkills);
          }

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
        // Check if it's a Prisma unique constraint error
        if (
          error instanceof Error &&
          error.message.includes("already exists")
        ) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } finally {
        setPending(false);
      }
    }
  }

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) =>
      console.log(value, name, type),
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
            {/* Course Information Fields */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* School Selection */}
              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select
                      disabled={
                        loadingSchools ||
                        !schoolsData ||
                        schoolsData.length === 0
                      }
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {loadingSchools ? (
                            <span>Loading schools...</span>
                          ) : (
                            <SelectValue placeholder="Select school" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {schoolsData?.map((school: SchoolData) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {schoolsData &&
                      schoolsData.length === 0 &&
                      !loadingSchools && (
                        <p className="text-muted-foreground text-sm">
                          No schools found for your institution.
                        </p>
                      )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Faculty Selection */}
              <FormField
                control={form.control}
                name="facultyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculty</FormLabel>
                    <Select
                      disabled={!selectedSchoolId || faculties.length === 0}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {selectedSchoolId ? (
                            faculties.length === 0 ? (
                              <span>No faculties available</span>
                            ) : (
                              <SelectValue placeholder="Select faculty" />
                            )
                          ) : (
                            <span>Select a school first</span>
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {faculties.map((faculty: FacultyData) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {selectedSchoolId && faculties.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        No faculties found for the selected school.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <Select
                      disabled={
                        !selectedFacultyId || availableCourses.length === 0
                      }
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCourseSelect(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {selectedFacultyId ? (
                            availableCourses.length === 0 ? (
                              <span>No courses available</span>
                            ) : (
                              <SelectValue placeholder="Select course code" />
                            )
                          ) : (
                            <span>Select a faculty first</span>
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {availableCourses.map((course) => (
                            <SelectItem key={course.code} value={course.code}>
                              {course.code} - {course.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {selectedFacultyId && availableCourses.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        No courses found for the selected faculty.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Course Title"
                        {...field}
                        disabled={
                          !!form.watch("code") && availableCourses.length > 0
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course Cover Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Course Cover Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {form.watch("image") ? (
                          <div className="flex flex-col items-start gap-2">
                            <img
                              src={form.watch("image")}
                              alt="Course Cover Preview"
                              className="h-40 w-full rounded-md object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => form.setValue("image", "")}
                            >
                              Remove Image
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            <UploadButton
                              endpoint="courseCoverImage"
                              onClientUploadComplete={(res) => {
                                if (res && res[0]) {
                                  form.setValue("image", res[0].url);
                                  toast.success("Image uploaded successfully!");
                                }
                              }}
                              onUploadError={(error: Error) => {
                                toast.error(`ERROR! ${error.message}`);
                              }}
                            />
                            <p className="text-muted-foreground text-sm">
                              Recommended size: 1200x630px (1.91:1 ratio)
                            </p>
                          </div>
                        )}
                      </div>
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
                        placeholder="Credits"
                        type="number"
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
                        placeholder="Estimated Hours"
                        type="number"
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      disabled={
                        user?.role === "PROFESSOR" &&
                        course?.status === CourseStatus.PUBLISHED
                      }
                      onValueChange={field.onChange}
                      value={field.value}
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
                                    <span className="ml-2 text-muted-foreground text-xs">
                                      (Submit for institution approval)
                                    </span>
                                  )}
                              </SelectItem>
                            ),
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {user?.role === "PROFESSOR" && (
                      <p className="text-muted-foreground text-sm">
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
                      {...field}
                      placeholder="Enter learning objectives "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add Skills Selection */}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teachable Skills</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      emptyIndicator={
                        <p className="text-center text-gray-600 text-lg leading-10 dark:text-gray-400">
                          {selectedFaculty
                            ? "No skills found for this faculty."
                            : "Select a faculty to view available skills."}
                        </p>
                      }
                      onChange={(selectedOptions: Option[]) =>
                        field.onChange(
                          selectedOptions.map((option) => option.value),
                        )
                      }
                      options={facultySkillOptions}
                      placeholder="Select skills this course teaches..."
                      value={
                        field.value?.map((value: string) => ({
                          label: value,
                          value,
                        })) || []
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedFaculty && facultySkillOptions.length > 0
                      ? "Select the skills that students will acquire by completing this course. Search and select skills from the faculty list."
                      : "Select a faculty to view and select skills."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display faculty skills when available */}
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
          <Button
            className="flex-1"
            disabled={pending}
            type="submit"
            variant="default"
          >
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
