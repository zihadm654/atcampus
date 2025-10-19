"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CourseStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { JsonToHtml } from "@/components/editor/JsonToHtml";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

const reviewSchema = z.object({
  decision: z.enum(["PUBLISHED", "REJECTED", "NEEDS_REVISION"]),
  comments: z.string().optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  contentQualityScore: z.number().min(0).max(100).optional(),
  pedagogyQualityScore: z.number().min(0).max(100).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface CourseApproval {
  id: string;
  courseId: string;
  reviewerId: string;
  status: string;
  comments: string | undefined;
  submittedAt: string;
  reviewedAt: string | undefined;
  course: {
    id: string;
    title: string;
    code: string;
    description: string;
    department?: string;
    difficulty?: string;
    credits?: number;
    estimatedHours?: number;

    objectives?: string[];
    outcomes?: string[];
    year?: number;
    instructor: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
    faculty: {
      name: string;
      school: {
        name: string;
        institution: {
          name: string;
          id: string;
        };
      };
    };
  };
  reviewer: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface CourseReviewFormProps {
  approval: CourseApproval;
  canReview: boolean;
}

export function CourseReviewForm({
  approval,
  canReview,
}: CourseReviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      decision: "PUBLISHED", // Default to PUBLISHED for approval
      comments: approval.comments || undefined,
      qualityScore: undefined,
      contentQualityScore: undefined,
      pedagogyQualityScore: undefined,
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        decision: data.decision,
        comments: data.comments,
        qualityScore: data.qualityScore,
        contentQualityScore: data.contentQualityScore,
        pedagogyQualityScore: data.pedagogyQualityScore,
      };

      const response = await fetch(`/api/course-approvals/${approval.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(`Course ${data.decision} processed successfully`);
        router.push("/courses/approvals");
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(
          `Failed to process review: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case CourseStatus.UNDER_REVIEW:
        return "default";
      case CourseStatus.PUBLISHED:
        return "success";
      case CourseStatus.REJECTED:
        return "destructive";
      case CourseStatus.NEEDS_REVISION:
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Course Details */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {approval.course.title}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {approval.course.code} • {approval.course.faculty.name}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2">
                <Badge
                  className="text-sm"
                  variant={getStatusColor(approval.status) as any}
                >
                  {approval.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="font-medium text-sm">Instructor</p>
                <p className="text-muted-foreground text-sm">
                  {approval.course.instructor.name}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">Institution</p>
                <p className="text-muted-foreground text-sm">
                  {approval.course.faculty.school.institution.name}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm">Description</h4>
              <p className="text-muted-foreground text-sm">
                <JsonToHtml json={JSON.parse(approval.course.description)} />
              </p>
            </div>
            <div>
              <p className="font-medium text-sm">Objectives</p>
              <ul className="list-inside list-disc text-muted-foreground text-sm">
                {approval.course.objectives?.map((obj, index) => (
                  <li key={index}>{obj}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-sm">Outcomes</p>
              <ul className="list-inside list-disc text-muted-foreground text-sm">
                {approval.course.outcomes?.map((out, index) => (
                  <li key={index}>{out}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {approval.comments && (
          <Card>
            <CardHeader>
              <CardTitle>Previous Reviewer Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {approval.comments}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Form */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Review Course</CardTitle>
            <CardDescription>Make a decision on this course.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="decision"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Decision</FormLabel>
                      <FormControl>
                        <RadioGroup
                          className="flex flex-col space-y-1"
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="PUBLISHED" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Approve and Publish
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="REJECTED" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Reject
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="NEEDS_REVISION" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Request Revision
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("decision") === "PUBLISHED" && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="qualityScore"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Overall Quality Score</FormLabel>
                            <span className="rounded-md bg-muted px-2 py-1 font-medium text-sm">
                              {field.value || 75}%
                            </span>
                          </div>
                          <FormControl>
                            <div className="pt-2">
                              <div className="mb-1 flex justify-between text-muted-foreground text-xs">
                                <span>0%</span>
                                <span>100%</span>
                              </div>
                              <Slider
                                className="w-full"
                                defaultValue={[field.value || 75]}
                                max={100}
                                min={0}
                                onValueChange={(val) => field.onChange(val[0])}
                                step={1}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contentQualityScore"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Content Quality Score</FormLabel>
                            <span className="rounded-md bg-muted px-2 py-1 font-medium text-sm">
                              {field.value || 75}%
                            </span>
                          </div>
                          <FormControl>
                            <div className="pt-2">
                              <div className="mb-1 flex justify-between text-muted-foreground text-xs">
                                <span>0%</span>
                                <span>100%</span>
                              </div>
                              <Slider
                                className="w-full"
                                defaultValue={[field.value || 75]}
                                max={100}
                                min={0}
                                onValueChange={(val) => field.onChange(val[0])}
                                step={1}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pedagogyQualityScore"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Pedagogy Quality Score</FormLabel>
                            <span className="rounded-md bg-muted px-2 py-1 font-medium text-sm">
                              {field.value || 75}%
                            </span>
                          </div>
                          <FormControl>
                            <div className="pt-2">
                              <div className="mb-1 flex justify-between text-muted-foreground text-xs">
                                <span>0%</span>
                                <span>100%</span>
                              </div>
                              <Slider
                                className="w-full"
                                defaultValue={[field.value || 75]}
                                max={100}
                                min={0}
                                onValueChange={(val) => field.onChange(val[0])}
                                step={1}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-y"
                          placeholder="Add any comments or feedback here..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  className="w-full"
                  disabled={isSubmitting || !canReview}
                  type="submit"
                >
                  {isSubmitting ? "Processing..." : "Submit Review"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
