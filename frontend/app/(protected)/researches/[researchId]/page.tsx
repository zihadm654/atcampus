import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  CalendarRange,
  Clock,
  DollarSign,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { getResearchDataInclude } from "@/types/types";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata, formatDate, formatRelativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonToHtml } from "@/components/editor/JsonToHtml";
import {
  AcceptCollaborationButton,
  DeclineCollaborationButton,
} from "@/components/researches/CollaborationButtons";
import ResearchMoreButton from "@/components/researches/ResearchMoreButton";
import { Icons } from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import UserTooltip from "@/components/UserTooltip";

interface PageProps {
  params: Promise<{ researchId: string }>;
}

const getResearch = cache(
  async (researchId: string, loggedInUserId: string) => {
    const research = await prisma.research.findUnique({
      where: {
        id: researchId,
      },
      include: getResearchDataInclude(loggedInUserId),
    });

    if (!research) notFound();

    return research;
  }
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { researchId } = await params;
  const user = await getCurrentUser();

  if (!user) return {};

  const research = await getResearch(researchId, user.id);

  return constructMetadata({
    title: `${research.user.displayUsername}: ${research.description.slice(0, 50)}...`,
  });
}
export default async function ResearchPage({ params }: PageProps) {
  const { researchId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const research = await getResearch(researchId, user.id);

  // If job not found, return 404
  if (!research) {
    notFound();
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="rounded-xl p-3 shadow-md">
        <h1 className="text-3xl font-bold">{research.title}</h1>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-6 py-4">
            <h4>Published on</h4>
            <Link
              className="text-muted-foreground block text-sm hover:underline"
              href={`/researches/${research.id}`}
              suppressHydrationWarning
            >
              {formatRelativeDate(research.createdAt)}
            </Link>
          </div>
          {research.user.id === user.id && (
            <ResearchMoreButton research={research} />
          )}
        </div>
        <div className="text-md mt-2 gap-4">
          <h5 className="font-semibold pb-4 text-xl">Authors</h5>
          <div className="flex items-center gap-3 py-2">
            <UserTooltip user={research.user}>
              <Link href={`/${research.user.username}`}>
                <UserAvatar user={research?.user} />
              </Link>
            </UserTooltip>
            <UserTooltip user={research?.user}>
              <Link
                className="text-md flex items-center gap-1 font-medium hover:underline"
                href={`/${research.user.username}`}
              >
                {research.user.name}
              </Link>
            </UserTooltip>
            {research.collaborators.map((collab) => (
              <div key={collab.id} className="flex items-center gap-2">
                <UserTooltip user={research.user}>
                  <Link href={`/${collab.username}`}>
                    <UserAvatar user={collab} />{" "}
                  </Link>
                </UserTooltip>
                <UserTooltip user={research?.user}>
                  <Link
                    className="text-md flex items-center gap-1 font-medium hover:underline"
                    href={`/${collab.username}`}
                  >
                    {collab.name}
                  </Link>
                </UserTooltip>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-card overflow-hidden rounded-2xl">
        <div className="flex-1 space-y-3 mb-4">
          <div className="rounded-xl border p-3 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              Abstract and Figures
            </h2>
            <JsonToHtml json={JSON.parse(research.description)} />
          </div>
        </div>
        {research.attachments.map((item) => (
          <object
            key={item.url}
            data={item.url}
            type="application/pdf"
            width="100%"
            height="700px"
          >
            <p>
              Unable to display PDF file. <a href={item.url}>Download</a>{" "}
              instead.
            </p>
          </object>
        ))}
        {/* {research.user.id === user.id &&
          research.collaborationRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Collaboration Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {research.collaborationRequests.map(
                  (req) =>
                    req.status === "PENDING" && (
                      <div
                        key={req.id}
                        className="flex items-center justify-between mb-2"
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar user={req.requester} />
                          <span>{req.requester.name} wants to collaborate</span>
                        </div>
                        <div>
                          <AcceptCollaborationButton requestId={req.id} />
                          <DeclineCollaborationButton requestId={req.id} />
                        </div>
                      </div>
                    )
                )}
              </CardContent>
            </Card>
          )} */}
      </div>
    </div>
  );
}
