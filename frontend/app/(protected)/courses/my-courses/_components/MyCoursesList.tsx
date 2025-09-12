"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { submitCourseForApproval } from "@/components/courses/actions";

interface Course {
    id: string;
    title: string;
    code: string;
    description: string;
    status: string;
    createdAt: Date;
    submittedForApprovalAt?: Date | null;
    lastReviewedAt?: Date | null;
    approvalNotes?: string | null;
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
        id: string;
        currentLevel: number;
        overallStatus: string;
        level1CompletedAt?: Date | null;
        level2CompletedAt?: Date | null;
        level3CompletedAt?: Date | null;
        revisionCount: number;
    } | null;
}

interface MyCoursesListProps {
    courses: Course[];
}

const statusColors = {
    DRAFT: "secondary",
    PENDING_REVIEW: "default",
    NEEDS_REVISION: "destructive",
    PUBLISHED: "success",
    REJECTED: "destructive",
    ARCHIVED: "secondary",
} as const;

const statusLabels = {
    DRAFT: "Draft",
    PENDING_REVIEW: "Under Review",
    NEEDS_REVISION: "Needs Revision",
    PUBLISHED: "Published",
    REJECTED: "Rejected",
    ARCHIVED: "Archived",
} as const;

export function MyCoursesList({ courses }: MyCoursesListProps) {
    const [submittingCourses, setSubmittingCourses] = useState<Set<string>>(new Set());
    const queryClient = useQueryClient();

    const handleSubmitForApproval = async (courseId: string) => {
        try {
            setSubmittingCourses(prev => new Set(prev).add(courseId));
            const result = await submitCourseForApproval(courseId);

            if (result.success) {
                toast.success("Course submitted for approval!");
                queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
                // Refresh the page to get updated data
                window.location.reload();
            } else {
                toast.error(result.error || "Failed to submit for approval");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmittingCourses(prev => {
                const newSet = new Set(prev);
                newSet.delete(courseId);
                return newSet;
            });
        }
    };

    const getApprovalStatusBadge = (course: Course) => {
        if (!course.approvalWorkflow) {
            return null;
        }

        const workflow = course.approvalWorkflow;
        const currentLevel = workflow.currentLevel;

        if (workflow.overallStatus === "PENDING") {
            const levelNames = ["Faculty", "School", "Institution"];
            return (
                <Badge variant="default" className="text-xs">
                    Level {currentLevel}: {levelNames[currentLevel - 1]} Review
                </Badge>
            );
        }

        return null;
    };

    if (courses.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground text-center">
                        You haven't created any courses yet.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/courses/createCourse">Create Your First Course</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
                <Card key={course.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                                <CardDescription className="text-sm">
                                    {course.code} • {course.faculty.name}
                                </CardDescription>
                            </div>
                            <Badge
                                // variant={statusColors[course.status as keyof typeof statusColors] || "secondary"}
                                className="text-xs shrink-0"
                            >
                                {statusLabels[course.status as keyof typeof statusLabels] || course.status}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 pb-3">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {course.description}
                        </p>

                        <div className="space-y-2 text-xs text-muted-foreground">
                            <div>
                                <strong>School:</strong> {course.faculty.school.name}
                            </div>
                            <div>
                                <strong>Created:</strong> {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
                            </div>

                            {course.submittedForApprovalAt && (
                                <div>
                                    <strong>Submitted:</strong> {formatDistanceToNow(new Date(course.submittedForApprovalAt), { addSuffix: true })}
                                </div>
                            )}

                            {course.approvalWorkflow && course.approvalWorkflow.revisionCount > 0 && (
                                <div>
                                    <strong>Revisions:</strong> {course.approvalWorkflow.revisionCount}
                                </div>
                            )}
                        </div>

                        {getApprovalStatusBadge(course) && (
                            <div className="mt-3">
                                {getApprovalStatusBadge(course)}
                            </div>
                        )}

                        {course.approvalNotes && (
                            <div className="mt-3 p-2 bg-muted rounded-md">
                                <p className="text-xs text-muted-foreground">
                                    <strong>Review Notes:</strong> {course.approvalNotes}
                                </p>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="pt-0 gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href={`/courses/${course.id}/edit`}>Edit</Link>
                        </Button>

                        {(course.status === "DRAFT" || course.status === "NEEDS_REVISION") && (
                            <Button
                                onClick={() => handleSubmitForApproval(course.id)}
                                disabled={submittingCourses.has(course.id)}
                                size="sm"
                                className="flex-1"
                            >
                                {submittingCourses.has(course.id) ? "Submitting..." : "Submit for Approval"}
                            </Button>
                        )}

                        {course.status === "PUBLISHED" && (
                            <Button asChild size="sm" className="flex-1">
                                <Link href={`/courses/${course.id}`}>View Course</Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}