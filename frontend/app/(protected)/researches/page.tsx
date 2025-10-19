import type { Metadata } from "next";
import { cache } from "react";
import ResearchFeed from "@/components/feed/ResearchFeed";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Research - AtCampus",
  description:
    "Find and apply for supplement research to gain practical experience.",
});

const getInitialResearch = cache(async () => {
  const research = await prisma.research.findMany({
    where: {
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },

      _count: {
        select: {
          savedResearch: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
  });

  return {
    research,
    nextCursor: research.length === 12 ? research[11].id : null,
  };
});

export default async function ResearchPage() {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const initialResearchData = await getInitialResearch();

  return (
    <div className="flex w-full flex-col gap-6">
      <ResearchFeed initialData={initialResearchData} />
    </div>
  );
}
