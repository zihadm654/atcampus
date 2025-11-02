"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { applyJob } from "@/actions/appllication";
import { getJobMatch } from "@/actions/job-matches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Client = ({ job, user }: any) => {
  // Fetch job match for students
  const { data: matchData, isLoading: isMatchLoading } = useQuery({
    queryKey: ["job-match", job.id],
    queryFn: () => getJobMatch(job.id),
    enabled: user.role === "STUDENT",
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleApply = async () => {
    const res = await applyJob(job.id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // Check if current user has applied
  const hasApplied = job.applications?.some(
    (application) => application.applicantId === user.id
  );

  return (
    <div className="flex flex-col gap-2">
      {user.role === "STUDENT" && (
        <div className="flex flex-col gap-2">
          {isMatchLoading ? (
            <Badge variant="secondary">Calculating match...</Badge>
          ) : matchData?.success ? (
            <MatchBadge matchData={matchData.match} />
          ) : null}
        </div>
      )}
      <Button
        disabled={hasApplied || user.role !== "STUDENT"}
        onClick={handleApply}
        variant="default"
      >
        {hasApplied ? "Already Applied" : "Apply Now"}
      </Button>
    </div>
  );
};

// Add this component for the skill match display
function MatchBadge({ matchData }: { matchData: any }) {
  // Extract match percentages
  const skillMatchPercentage = matchData?.skillMatchPercentage || 0;
  const courseMatchPercentage = matchData?.courseMatchPercentage || 0;
  const overallMatchPercentage = matchData?.matchPercentage || 0;

  // Determine color based on overall match
  let bgColor = "bg-red-500";
  const textColor = "text-white";

  if (overallMatchPercentage >= 80) {
    bgColor = "bg-green-500";
  } else if (overallMatchPercentage >= 60) {
    bgColor = "bg-yellow-500";
  } else if (overallMatchPercentage >= 40) {
    bgColor = "bg-orange-500";
  }

  return (
    <div className="flex flex-col gap-1">
      <Badge className={`${bgColor} ${textColor}`}>
        Match: {Math.round(overallMatchPercentage)}%
      </Badge>
      <div className="text-muted-foreground text-xs">
        Skills: {Math.round(skillMatchPercentage)}% | Courses:{" "}
        {Math.round(courseMatchPercentage)}%
      </div>
    </div>
  );
}

export default Client;
