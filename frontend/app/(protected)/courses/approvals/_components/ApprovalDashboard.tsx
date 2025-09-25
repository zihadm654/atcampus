"use client";


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

export function ApprovalDashboard({
  user,
  memberRoles,
}: ApprovalDashboardProps) {
  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(1);

  // Map the tab values to the API expected status values
  const statusMap: Record<string, string> = {
    pending: "UNDER_REVIEW",
    approved: "PUBLISHED",
    rejected: "REJECTED",
    needs_revision: "NEEDS_REVISION",
  };
  const apiStatus = statusMap[activeTab] || activeTab;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<{ approvals?: CourseApproval[]; pagination?: { pages?: number } }, Error>({
    queryKey: ["course-approvals", apiStatus, page],
    queryFn: async () => {
      const response = await fetch(
        `/api/course-approvals?status=${apiStatus}&page=${page}&limit=9`
      );
      if (!response.ok) {
        let errorMsg = "Failed to fetch course approvals";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch { }
        throw new Error(errorMsg);
      }
      return response.json();
    },
    // keepPreviousData is not supported in TanStack Query v5
    staleTime: 1000 * 30, // 30s
  });

  const approvals: CourseApproval[] = Array.isArray(data?.approvals) ? data?.approvals : [];
  const totalPages: number = data?.pagination?.pages ? Number(data.pagination.pages) : 1;

  const getLevelName = (level: number) => {
    const levels = ["Faculty", "School", "Institution"];
    return levels[level - 1] || `Level ${level}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNDER_REVIEW":
        return "default";
      case "PUBLISHED":
        return "success";
      case "REJECTED":
        return "destructive";
      case "NEEDS_REVISION":
        return "warning";
      default:
        return "secondary";
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading approvals...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">{(error as Error)?.message || "Failed to load approvals."}</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setPage(1); // Reset page when changing tabs
      }}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending
            <Badge variant="default" className="ml-2">
              {activeTab === "pending" ? approvals.length : ""}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="needs_revision">Needs Revision</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {(!approvals || approvals.length === 0) ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  No courses for approval.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
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
                            variant={getStatusColor(approval.status) as any}
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
                          <strong>Institution:</strong>{" "}
                          {approval.course.faculty.school.name}
                        </div>
                        <div>
                          <strong>Faculty:</strong> {approval.course.faculty.name}
                        </div>
                        <div>
                          <strong>Submitted:</strong>{" "}
                          {formatDistanceToNow(new Date(approval.submittedAt), {
                            addSuffix: true,
                          })}
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

                    <div className="p-3 border-t">
                      <Button
                        asChild
                        className="w-full"
                        size="sm"
                        variant={approval.status === "UNDER_REVIEW" ? "default" : "secondary"}
                      >
                        <Link href={`/courses/approvals/${approval.id}`}>
                          {approval.status === "UNDER_REVIEW"
                            ? "Review Course"
                            : "View Details"}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
