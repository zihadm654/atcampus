import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonToHtml } from "@/components/editor/JsonToHtml";
import {
  AcceptCollaborationButton,
  DeclineCollaborationButton,
} from "@/components/researches/CollaborationButtons";
import ResearchMoreButton from "@/components/researches/ResearchMoreButton";
import { UserAvatar } from "@/components/shared/user-avatar";
import UserTooltip from "@/components/UserTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata, formatRelativeDate } from "@/lib/utils";
import { getResearchDataInclude } from "@/types/types";

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
    title: `${research.title}`,
    description: `${research.description}`,
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
        <h1 className="font-bold text-3xl">{research.title}</h1>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-6 py-4">
            <h4>Published on</h4>
            <Link
              className="block text-muted-foreground text-sm hover:underline"
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
        <div className="mt-2 gap-4 text-md">
          <h5 className="pb-4 font-semibold text-xl">Authors</h5>
          <div className="flex items-center gap-3 py-2">
            <UserTooltip user={research.user}>
              <Link href={`/${research.user.username}`}>
                <UserAvatar user={research?.user} />
              </Link>
            </UserTooltip>
            <UserTooltip user={research?.user}>
              <Link
                className="flex items-center gap-1 font-medium text-md hover:underline"
                href={`/${research.user.username}`}
              >
                {research.user.name}
              </Link>
            </UserTooltip>
            {research.collaborators.map((collab) => (
              <div className="flex items-center gap-2" key={collab.id}>
                <UserTooltip user={research.user}>
                  <Link href={`/${collab.username}`}>
                    <UserAvatar user={collab} />{" "}
                  </Link>
                </UserTooltip>
                <UserTooltip user={research?.user}>
                  <Link
                    className="flex items-center gap-1 font-medium text-md hover:underline"
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
      <div className="overflow-hidden rounded-2xl bg-card">
        <div className="mb-4 flex-1 space-y-3">
          <div className="rounded-xl border p-3 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-lg">
              Abstract and Figures
            </h2>
            <JsonToHtml json={JSON.parse(research.description)} />
          </div>
        </div>
        {research.attachments.map((item) => (
          <object
            data={item.url}
            height="700px"
            key={item.url}
            type="application/pdf"
            width="100%"
          >
            <p>
              Unable to display PDF file. <a href={item.url}>Download</a>{" "}
              instead.
            </p>
          </object>
        ))}
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
                        className="mb-2 flex items-center justify-between"
                        key={req.id}
                      >
                        <div className="flex items-center gap-2">
                          <UserAvatar user={req.requester} />
                          <span>{req.requester.name} wants to collaborate</span>
                        </div>
                        <div className="gap-2 space-x-2">
                          <AcceptCollaborationButton requestId={req.id} />
                          <DeclineCollaborationButton requestId={req.id} />
                        </div>
                      </div>
                    ),
                )}
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
