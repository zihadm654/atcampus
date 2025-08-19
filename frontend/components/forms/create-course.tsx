"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User, Course, Faculty } from "@prisma/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { courseSchema, Status, TCourse } from "@/lib/validations/course";
import { createCourse, updateCourse } from "@/components/courses/actions";
import { coursesData } from "@/config/course";

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
import JobDescriptionEditor from "@/components/editor/richEditor"; // Adapt or rename if needed

interface CreateCourseFormProps {
  user?: User;
  course?: Course;
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
          status: course.status as Status,
          code: course.code || "",
          department: course.department || "",
          prerequisites: course.prerequisites || [],
          credits: course.credits || 0,
          level: course.level || "",
          duration: course.duration || 0,
          facultyId: course.facultyId || "",
        }
      : {
          title: "",
          description: "",
          status: "draft" as Status,
          code: "",
          department: "",
          duration: 0,
          prerequisites: [],
          credits: 0,
          level: "",
          facultyId: "",
        },
  });
  const queryClient = useQueryClient();

  const { data: faculties } = useQuery<Faculty[]>({
    queryKey: ["faculties"],
    queryFn: async () => {
      const res = await fetch("/api/faculties");
      if (!res.ok) throw new Error("Failed to fetch faculties");
      return res.json();
    },
  });
  console.log(faculties, "faculties");

  const schools = coursesData.schools;
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const departments = selectedSchool
    ? schools.find((s) => s.name === selectedSchool)?.departments || []
    : [];
  const coursesList = selectedDepartment
    ? departments.find((d) => d.name === selectedDepartment)?.courses || []
    : [];

  useEffect(() => {
    if (course && course.code) {
      for (const school of schools) {
        for (const dept of school.departments) {
          for (const c of dept.courses) {
            if (c.code === course.code) {
              setSelectedSchool(school.name);
              setSelectedDepartment(dept.name);
              setSelectedCourse(c.code);
              return;
            }
          }
        }
      }
    }
  }, [course, schools]);

  async function onSubmit(values: TCourse) {
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
        await createCourse(values);
        toast.success("Course created successfully!");
        queryClient.invalidateQueries({ queryKey: ["course-feed"] });
        form.reset();
        router.push("/courses");
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
            <div className="grid gap-6 md:grid-cols-2">
              <FormItem>
                <FormLabel>Select School</FormLabel>
                <Select
                  value={selectedSchool}
                  onValueChange={(value) => {
                    setSelectedSchool(value);
                    setSelectedDepartment("");
                    setSelectedCourse("");
                    form.setValue("title", "");
                    form.setValue("department", "");
                    form.setValue("code", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem
                        className="overflow-x-hidden max-w-[40vw] max-h-[300px]"
                        key={school.name}
                        value={school.name}
                      >
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
              <FormItem>
                <FormLabel>Select Department</FormLabel>
                <Select
                  value={selectedDepartment}
                  onValueChange={(value) => {
                    setSelectedDepartment(value);
                    setSelectedCourse("");
                    form.setValue("title", "");
                    form.setValue("department", value);
                    form.setValue("code", "");
                  }}
                  disabled={!selectedSchool}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem
                        className="overflow-x-hidden"
                        key={dept.name}
                        value={dept.name}
                      >
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
              <FormItem>
                <FormLabel>Select Course</FormLabel>
                <Select
                  value={selectedCourse}
                  onValueChange={(value) => {
                    setSelectedCourse(value);
                    const courseSelected = coursesList.find(
                      (c) => c.code === value
                    );
                    if (courseSelected) {
                      form.setValue("title", courseSelected.name);
                      form.setValue("code", courseSelected.code);
                    }
                  }}
                  disabled={!selectedDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesList.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Course Title" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="department" {...field} />
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
                      <Input placeholder="Course Code" {...field} disabled />
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
                      <Input type="number" placeholder="Credits" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (weeks)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Duration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input placeholder="Level (e.g., Beginner)" {...field} />
                    </FormControl>
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
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(Status).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() +
                                status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                      {faculties?.map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prerequisites"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prerequisites</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter prerequisites separated by commas"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.split(",").map((p) => p.trim())
                        )
                      }
                      value={field.value.join(", ")}
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

        <Button className="w-full" disabled={pending} type="submit">
          {pending
            ? "Submitting..."
            : course
              ? "Update Course"
              : "Create Course"}
        </Button>
      </form>
    </Form>
  );
}
