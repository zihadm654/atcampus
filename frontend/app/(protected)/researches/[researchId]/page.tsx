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
  },
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
    <div className="flex w-full flex-col gap-6">
      {/* Header with gradient background */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500/80 to-indigo-600/80 p-6 text-white shadow-md">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
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
                  <ShieldCheck className="size-5 text-blue-700" />
                </Link>
              </UserTooltip>
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
          {research.collaborators.map((collab) => (
            <div key={collab.id} className="flex items-center gap-2">
              <UserAvatar user={collab} />
              <span>{collab.name}</span>
            </div>
          ))}
          <div className="text-md mt-2 gap-4"></div>
        </div>
      </div>
      <div className="bg-card overflow-hidden rounded-2xl shadow-sm">
        <Tabs defaultValue="summary">
          <div className="border-b border-gray-100">
            <TabsList className="flex w-full justify-between p-0">
              <TabsTrigger
                className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="summary"
              >
                <Icons.home className="size-5" />
                Description
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="requirements"
              >
                <Icons.post className="size-5" />
                Requirements
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-none border-b-2 border-transparent py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="qualifications"
              >
                <Icons.post className="size-5" />
                Qualifications
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="p-6" value="summary">
            {/* Main content */}
            <div className="flex-1 space-y-6">
              <div className="bg-card rounded-xl border p-3 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  <span className="rounded-full bg-blue-100 p-1.5 text-blue-700">
                    <Briefcase className="h-5 w-5" />
                  </span>
                  Summary
                </h2>
                <JsonToHtml json={JSON.parse(research.description)} />
              </div>
              {research.user.id === user.id &&
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
                                <span>
                                  {req.requester.name} wants to collaborate
                                </span>
                              </div>
                              <div>
                                <AcceptCollaborationButton requestId={req.id} />
                                <DeclineCollaborationButton
                                  requestId={req.id}
                                />
                              </div>
                            </div>
                          ),
                      )}
                    </CardContent>
                  </Card>
                )}
            </div>
            {research.attachments.map((item) => (
              <object
                data={item.url}
                type="application/pdf"
                width="100%"
                height="500px"
              >
                <p>
                  Unable to display PDF file. <a href={item.url}>Download</a>{" "}
                  instead.
                </p>
              </object>
            ))}
          </TabsContent>
          <TabsContent className="mx-auto max-w-2xl p-6" value="requirements">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <span className="rounded-full bg-green-100 p-1.5 text-green-700">
                  <Briefcase className="h-5 w-5" />
                </span>
                Responsibilities
              </h2>
            </div>
          </TabsContent>
          <TabsContent className="p-6" value="qualifications">
            {/* <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <span className="rounded-full bg-purple-100 p-1.5 text-purple-700">
                <GraduationCap className="h-5 w-5" />
              </span>
              Qualifications
            </h2>
            <ul className="text-muted-foreground space-y-3">
              {job.qualifications.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div> */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
