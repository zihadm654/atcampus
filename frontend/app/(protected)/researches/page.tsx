import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import ResearchFeed from "@/components/feed/ResearchFeed";

export const metadata: Metadata = constructMetadata({
  title: "Research - AtCampus",
  description:
    "Find and apply for supplement research to gain practical experience.",
});

export default async function ResearchPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="flex w-full flex-col gap-6">
      <ResearchFeed />
    </div>
  );
}
