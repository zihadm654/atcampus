"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

interface User {
    id: string;
    name: string;
    role: string;
}

interface MemberRole {
    id: string;
    role: string;
    organizationId: string;
    facultyId?: string;
    organization: {
        name: string;
    };
    faculty?: {
        name: string;
        school: {
            name: string;
        };
    };
}

interface CourseApproval {
    id: string;
    courseId: string;
    reviewerId: string;
    status: string;
    comments?: string;
    approvalLevel: number;
    submittedAt: Date;
    course: {
        id: string;
        title: string;
        code: string;
        description: string;
        createdBy: {
            name: string;
            email: string;
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
    };
}

interface ApprovalDashboardProps {
    user: User;
    memberRoles: MemberRole[];
}

export function ApprovalDashboard({ user, memberRoles }: ApprovalDashboardProps) {
    const [approvals, setApprovals] = useState<CourseApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");

    useEffect(() => {
        fetchApprovals();
    }, [activeTab]);

    const fetchApprovals = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/course-approvals?status=${activeTab}`);
            if (response.ok) {
                const data = await response.json();
                setApprovals(data.approvals || []);
            } else {
                toast.error("Failed to fetch course approvals");
            }
        } catch (error) {
            console.error("Error fetching approvals:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading approvals...</p>
                </div>
            </div>
        );
    }

    return (
        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="needs_revision">Needs Revision</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
                {approvals.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground text-center">
                                No {activeTab} course approvals found.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {approvals.map((approval) => (
                            <Card key={approval.id} className="flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg line-clamp-2">
                                                {approval.course.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm">
                                                {approval.course.code} • {approval.course.faculty.name}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col gap-1 shrink-0">
                                            <Badge
                                                // variant={getStatusColor(approval.status)}
                                                className="text-xs"
                                            >
                                                {approval.status.replace("_", " ")}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {getLevelName(approval.approvalLevel)}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 pb-3">
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                        {approval.course.description}
                                    </p>

                                    <div className="space-y-2 text-xs text-muted-foreground">
                                        <div>
                                            <strong>Creator:</strong> {approval.course.createdBy.name}
                                        </div>
                                        <div>
                                            <strong>School:</strong> {approval.course.faculty.school.name}
                                        </div>
                                        <div>
                                            <strong>Submitted:</strong> {formatDistanceToNow(new Date(approval.submittedAt), { addSuffix: true })}
                                        </div>
                                    </div>

                                    {approval.comments && (
                                        <div className="mt-3 p-2 bg-muted rounded-md">
                                            <p className="text-xs text-muted-foreground">
                                                <strong>Comments:</strong> {approval.comments}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>

                                <div className="px-6 pb-6">
                                    <Button asChild className="w-full" size="sm">
                                        <Link href={`/courses/approvals/${approval.id}`}>
                                            {approval.status === "PENDING" ? "Review Course" : "View Details"}
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}