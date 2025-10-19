"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  name: string;
  role: string;
}

interface CourseApproval {
  id: string;
  courseId: string;
  reviewerId: string;
  status: string;
  comments?: string;
  submittedAt: Date;
  course: {
    id: string;
    title: string;
    code: string;
    description: string;
    instructor: {
      name: string;
      email: string;
    };
    faculty: {
      name: string;
      school: {
        name: string;
        institution: {
          name: string;
        };
      };
    };
  };
}

interface ApprovalDashboardProps {
  user: User;
}

export function ApprovalDashboard({ user }: ApprovalDashboardProps) {
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

  const { data, isLoading, isError, error, refetch } = useQuery<
    { approvals?: CourseApproval[]; pagination?: { pages?: number } },
    Error
  >({
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
        } catch {
          throw new Error(errorMsg);
        }
      }
      return response.json();
    },
    // keepPreviousData is not supported in TanStack Query v5
    staleTime: 1000 * 30, // 30s
  });

  const approvals: CourseApproval[] = Array.isArray(data?.approvals)
    ? data?.approvals
    : [];
  const totalPages: number = data?.pagination?.pages
    ? Number(data.pagination.pages)
    : 1;

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
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-2 text-muted-foreground">Loading approvals...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="mb-2 font-semibold text-destructive">
            {(error as Error)?.message || "Failed to load approvals."}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        onValueChange={(value) => {
          setActiveTab(value);
          setPage(1); // Reset page when changing tabs
        }}
        value={activeTab}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending
            <Badge className="ml-2" variant="default">
              {activeTab === "pending" ? approvals.length : ""}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="needs_revision">Needs Revision</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6" value={activeTab}>
          {!approvals || approvals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-muted-foreground">
                  No courses for approval.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {approvals.map((approval) => (
                  <Card className="flex flex-col" key={approval.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="line-clamp-2 text-lg">
                            {approval.course.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {approval.course.code} •{" "}
                            {approval.course.faculty.name}
                          </CardDescription>
                        </div>
                        <div className="flex shrink-0 flex-col gap-1">
                          <Badge
                            className="text-xs"
                            variant={getStatusColor(approval.status) as any}
                          >
                            {approval.status.replace("_", " ")}
                          </Badge>
                          {/* Removed approval level badge as it's not in the data model */}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 pb-3">
                      <p className="mb-3 line-clamp-3 text-muted-foreground text-sm">
                        <JsonToHtml
                          json={JSON.parse(approval.course.description)}
                        />
                      </p>

                      <div className="space-y-2 text-muted-foreground text-xs">
                        <div>
                          <strong>Creator:</strong>{" "}
                          {approval.course.instructor?.name}
                        </div>
                        <div>
                          <strong>Institution:</strong>{" "}
                          {approval.course.faculty.school.institution.name}
                        </div>
                        <div>
                          <strong>Faculty:</strong>{" "}
                          {approval.course.faculty.name}
                        </div>
                        <div>
                          <strong>Submitted:</strong>{" "}
                          {formatDistanceToNow(new Date(approval.submittedAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>

                      {approval.comments && (
                        <div className="mt-3 rounded-md bg-muted p-2">
                          <p className="text-muted-foreground text-xs">
                            <strong>Comments:</strong> {approval.comments}
                          </p>
                        </div>
                      )}
                    </CardContent>

                    <div className="border-t p-3">
                      <Button
                        asChild
                        className="w-full"
                        size="sm"
                        variant={
                          approval.status === "UNDER_REVIEW"
                            ? "default"
                            : "secondary"
                        }
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
                <div className="mt-6 flex justify-center gap-2">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    size="sm"
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <Button
                          key={p}
                          onClick={() => setPage(p)}
                          size="sm"
                          variant={p === page ? "default" : "outline"}
                        >
                          {p}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    size="sm"
                    variant="outline"
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
