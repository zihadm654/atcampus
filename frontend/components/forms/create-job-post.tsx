"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExperienceLevel, type Job, JobType, type User } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getCourses } from "@/components/courses/actions";
import JobDescriptionEditor from "@/components/editor/richEditor";
import { createJob, updateJob } from "@/components/jobs/actions";
import { cn } from "@/lib/utils";
import { jobSchema, type TJob } from "@/lib/validations/job";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface CreateJobFormProps {
  user?: User;
  job?: Job & {
    jobCourses?: {
      courseId: string;
    }[];
  };
}

// Sample skill options - in a real app, these would be fetched from an API
const SKILL_OPTIONS: Option[] = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "React", value: "react" },
  { label: "Next.js", value: "nextjs" },
  { label: "Node.js", value: "nodejs" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C#", value: "csharp" },
  { label: "PHP", value: "php" },
  { label: "Ruby", value: "ruby" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "SQL", value: "sql" },
  { label: "MongoDB", value: "mongodb" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "Docker", value: "docker" },
  { label: "Kubernetes", value: "kubernetes" },
  { label: "AWS", value: "aws" },
  { label: "Azure", value: "azure" },
  { label: "Google Cloud", value: "gcp" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Tailwind CSS", value: "tailwind" },
  { label: "Bootstrap", value: "bootstrap" },
  { label: "Git", value: "git" },
  { label: "CI/CD", value: "cicd" },
  { label: "Agile", value: "agile" },
  { label: "Scrum", value: "scrum" },
  { label: "Project Management", value: "project-management" },
  { label: "UI/UX Design", value: "ui-ux" },
];

export function CreateJobForm({ job }: CreateJobFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<TJob>({
    resolver: zodResolver(jobSchema),
    defaultValues: job
      ? {
          ...job,
          type: job.type as JobType,
          experienceLevel: job.experienceLevel as ExperienceLevel,
          endDate: new Date(job.endDate),
          duration: job.duration || undefined,
          courseIds: job.jobCourses?.map((jc) => jc.courseId) || [],
          summary: job.summary || "", // Convert null to empty string
          skills: job.skills || [],
        }
      : {
          title: "",
          summary: "",
          description: "",
          location: "",
          weeklyHours: 0,
          type: JobType.INTERNSHIP,
          experienceLevel: ExperienceLevel.ENTRY_LEVEL,
          salary: 0,
          endDate: new Date(),
          courseIds: [],
          skills: [],
        },
  });
  const queryClient = useQueryClient();

  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: getCourses,
  });

  // Update the form when courses data loads and we're editing an existing job
  useEffect(() => {
    if (courses && job && job.jobCourses) {
      // Make sure the courseIds in the form match the job's jobCourses
      const courseIds = job.jobCourses.map((jc) => jc.courseId);
      form.setValue("courseIds", courseIds);
    }
  }, [courses, job, form]);

  async function onSubmit(values: TJob) {
    if (job) {
      try {
        setPending(true);
        console.log(values);

        const result = await updateJob(values, job.id);

        if (result.success) {
          toast.success("Job updated successfully!");
          queryClient.invalidateQueries({ queryKey: ["job-feed"] });
          form.reset();
          router.push("/jobs");
        } else {
          toast.error(result.error || "Failed to update job");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setPending(false);
      }
    } else {
      try {
        setPending(true);
        console.log(values);

        const result = await createJob(values);
        if (result.success && result.data?.id) {
          toast.success("Job created successfully!");
          queryClient.invalidateQueries({ queryKey: ["job-feed"] });
          form.reset();
          router.push("/jobs");
        } else {
          toast.error(result.error || "Failed to create job");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setPending(false);
      }
    }
  }

  const type = form.watch("type");
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
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Job Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea placeholder="job summary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Employment Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Employment Type</SelectLabel>
                          {(Object.values(JobType) as string[]).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() +
                                type.slice(1).toLowerCase()}
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
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Experience Level</SelectLabel>
                          {(Object.values(ExperienceLevel) as string[]).map(
                            (roleValue) => (
                              <SelectItem key={roleValue} value={roleValue}>
                                {roleValue.charAt(0).toUpperCase() +
                                  roleValue.slice(1).toLowerCase()}
                              </SelectItem>
                            )
                          )}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <JobDescriptionEditor field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="courseIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Courses (Optional)</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        defaultOptions={
                          isLoadingCourses
                            ? []
                            : courses?.map((course) => ({
                                label: `${course.title} (${course.code})`,
                                value: course.id,
                              })) || []
                        }
                        emptyIndicator={
                          <p className="text-center text-gray-600 text-lg leading-10 dark:text-gray-400">
                            {isLoadingCourses
                              ? "Loading courses..."
                              : "No courses found."}
                          </p>
                        }
                        onChange={(selectedOptions: Option[]) =>
                          field.onChange(
                            selectedOptions.map((option) => option.value)
                          )
                        }
                        placeholder={
                          isLoadingCourses
                            ? "Loading courses..."
                            : "Select associated courses..."
                        }
                        value={
                          courses && field.value
                            ? (field.value
                                .map((id) => {
                                  const course = courses.find(
                                    (c) => c.id === id
                                  );
                                  return course
                                    ? {
                                        label: `${course.title} (${course.code})`,
                                        value: course.id,
                                      }
                                    : null;
                                })
                                .filter(Boolean) as Option[])
                            : []
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        defaultOptions={SKILL_OPTIONS}
                        emptyIndicator={
                          <p className="text-center text-gray-600 text-lg leading-10 dark:text-gray-400">
                            No skills found.
                          </p>
                        }
                        onChange={(selectedOptions: Option[]) =>
                          field.onChange(
                            selectedOptions.map((option) => option.value)
                          )
                        }
                        placeholder="Select required skills..."
                        value={SKILL_OPTIONS?.filter((option) =>
                          field.value?.includes(option.value)
                        )}
                      />
                    </FormControl>
                    <FormDescription>
                      Select the skills required for this position
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Application Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            variant={"outline"}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          captionLayout="dropdown"
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Last date to apply for this job.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {type === JobType.INTERNSHIP && (
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (months)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Duration in months"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="weeklyHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Hours</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Weekly Hours"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary (USD)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Salary in USD"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Button
          className="w-full"
          disabled={pending}
          type="submit"
          variant="default"
        >
          {pending ? "Submitting..." : "Continue"}
        </Button>
      </form>
    </Form>
  );
}
