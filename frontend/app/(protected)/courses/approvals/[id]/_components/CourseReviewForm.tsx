"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatDistanceToNow } from "date-fns";

const reviewSchema = z.object({
    decision: z.enum(["approve", "reject", "request_revision"]),
    comments: z.string().optional(),
    contentQuality: z.number().min(1).max(5).optional(),
    academicRigor: z.number().min(1).max(5).optional(),
    resourceAdequacy: z.number().min(1).max(5).optional(),
    overallScore: z.number().min(1).max(5).optional(),
    requiredChanges: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface CourseApproval {
    id: string;
    courseId: string;
    reviewerId: string;
    status: string;
    comments?: string;
    approvalLevel: number;
    submittedAt: Date;
    reviewedAt?: Date;
    contentQuality?: number;
    academicRigor?: number;
    resourceAdequacy?: number;
    overallScore?: number;
    course: {
        id: string;
        title: string;
        code: string;
        description: string;
        department?: string;
        level?: string;
        credits?: number;
        duration?: number;
        prerequisites: string[];
        objectives?: string[];
        outcomes?: string[];
        year?: number;
        user: {
            id: string;
            name: string;
            email: string;
            image?: string;
        };
        faculty: {
            name: string;
            school: {
                name: string;
                organization: {
                    name: string;
                };
            };
        };
        approvalWorkflow?: {
            currentLevel: number;
            overallStatus: string;
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

export function CourseReviewForm({ approval, canReview }: CourseReviewFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ReviewFormData>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            decision: "approve",
            comments: approval.comments || "",
            contentQuality: approval.contentQuality || 4,
            academicRigor: approval.academicRigor || 4,
            resourceAdequacy: approval.resourceAdequacy || 4,
            overallScore: approval.overallScore || 4,
        },
    });

    const onSubmit = async (data: ReviewFormData) => {
        try {
            setIsSubmitting(true);

            const payload = {
                ...data,
                requiredChanges: data.requiredChanges
                    ? data.requiredChanges.split(",").map(change => change.trim()).filter(Boolean)
                    : [],
            };

            const response = await fetch(`/api/course-approvals/${approval.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success(`Course ${data.decision} processed successfully`);
                router.push("/courses/approvals");
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to process review");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getLevelName = (level: number) => {
        const levels = ["Faculty", "School", "Institution"];
        return levels[level - 1] || `Level ${level}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "default";
            case "APPROVED":
                return "success";
            case "REJECTED":
                return "destructive";
            case "NEEDS_REVISION":
                return "destructive";
            default:
                return "secondary";
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Course Details */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{approval.course.title}</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    {approval.course.code} • {approval.course.faculty.name}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Badge
                                    // variant={getStatusColor(approval.status)}
                                    className="text-sm"
                                >
                                    {approval.status.replace("_", " ")}
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                    {getLevelName(approval.approvalLevel)} Review
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-muted-foreground">{approval.course.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {approval.course.level && (
                                <div>
                                    <h5 className="font-medium text-sm">Level</h5>
                                    <p className="text-muted-foreground text-sm">{approval.course.level}</p>
                                </div>
                            )}
                            {approval.course.credits && (
                                <div>
                                    <h5 className="font-medium text-sm">Credits</h5>
                                    <p className="text-muted-foreground text-sm">{approval.course.credits}</p>
                                </div>
                            )}
                            {approval.course.duration && (
                                <div>
                                    <h5 className="font-medium text-sm">Duration</h5>
                                    <p className="text-muted-foreground text-sm">{approval.course.duration} weeks</p>
                                </div>
                            )}
                            {approval.course.year && (
                                <div>
                                    <h5 className="font-medium text-sm">Year</h5>
                                    <p className="text-muted-foreground text-sm">{approval.course.year}</p>
                                </div>
                            )}
                        </div>

                        {approval.course.prerequisites.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Prerequisites</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                    {approval.course.prerequisites.map((prereq, index) => (
                                        <li key={index}>{prereq}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {approval.course.objectives && approval.course.objectives.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Learning Objectives</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                    {approval.course.objectives.map((objective, index) => (
                                        <li key={index}>{objective}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {approval.course.outcomes && approval.course.outcomes.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Learning Outcomes</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                    {approval.course.outcomes.map((outcome, index) => (
                                        <li key={index}>{outcome}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Review Form */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Course Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <strong>Creator:</strong> {approval.course.user.name}
                        </div>
                        <div>
                            <strong>School:</strong> {approval.course.faculty.school.name}
                        </div>
                        <div>
                            <strong>Organization:</strong> {approval.course.faculty.school.organization.name}
                        </div>
                        <div>
                            <strong>Submitted:</strong> {formatDistanceToNow(new Date(approval.submittedAt), { addSuffix: true })}
                        </div>
                        {approval.reviewedAt && (
                            <div>
                                <strong>Reviewed:</strong> {formatDistanceToNow(new Date(approval.reviewedAt), { addSuffix: true })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {canReview && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Review Decision</CardTitle>
                            <CardDescription>
                                Make your approval decision for this course
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="decision"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Decision</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        className="space-y-2"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="approve" id="approve" />
                                                            <Label htmlFor="approve">Approve</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="request_revision" id="request_revision" />
                                                            <Label htmlFor="request_revision">Request Revision</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="reject" id="reject" />
                                                            <Label htmlFor="reject">Reject</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="comments"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Comments</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Provide feedback about the course..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {form.watch("decision") === "request_revision" && (
                                        <FormField
                                            control={form.control}
                                            name="requiredChanges"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Required Changes</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="List specific changes needed (comma-separated)..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <div className="space-y-4">
                                        <h4 className="font-medium">Quality Assessment (Optional)</h4>

                                        <FormField
                                            control={form.control}
                                            name="contentQuality"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Content Quality: {field.value}/5</FormLabel>
                                                    <FormControl>
                                                        <Slider
                                                            min={1}
                                                            max={5}
                                                            step={1}
                                                            value={[field.value || 4]}
                                                            onValueChange={(value) => field.onChange(value[0])}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="academicRigor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Academic Rigor: {field.value}/5</FormLabel>
                                                    <FormControl>
                                                        <Slider
                                                            min={1}
                                                            max={5}
                                                            step={1}
                                                            value={[field.value || 4]}
                                                            onValueChange={(value) => field.onChange(value[0])}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="overallScore"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Overall Score: {field.value}/5</FormLabel>
                                                    <FormControl>
                                                        <Slider
                                                            min={1}
                                                            max={5}
                                                            step={1}
                                                            value={[field.value || 4]}
                                                            onValueChange={(value) => field.onChange(value[0])}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Processing..." : "Submit Review"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}

                {!canReview && approval.status !== "PENDING" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Review Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <strong>Reviewer:</strong> {approval.reviewer.name}
                            </div>
                            {approval.comments && (
                                <div>
                                    <strong>Comments:</strong>
                                    <p className="mt-1 text-muted-foreground">{approval.comments}</p>
                                </div>
                            )}
                            {approval.contentQuality && (
                                <div>
                                    <strong>Content Quality:</strong> {approval.contentQuality}/5
                                </div>
                            )}
                            {approval.academicRigor && (
                                <div>
                                    <strong>Academic Rigor:</strong> {approval.academicRigor}/5
                                </div>
                            )}
                            {approval.overallScore && (
                                <div>
                                    <strong>Overall Score:</strong> {approval.overallScore}/5
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}