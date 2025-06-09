import { Suspense } from "react";

import { constructMetadata } from "@/lib/utils";
import ForYouFeed from "@/components/feed/ForYouFeed";
import TrendsSidebar from "@/components/feed/TrendsSidebar";
import PostEditor from "@/components/posts/editor/PostEditor";
import { SkeletonSection } from "@/components/shared/section-skeleton";

export const metadata = constructMetadata({
  title: "Home - AtCampus",
  description: "Explore atCampus feed for knowledge.",
});

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Suspense fallback={<SkeletonSection />}>
          <PostEditor />
        </Suspense>
        <Suspense fallback={<SkeletonSection />}>
          <ForYouFeed />
        </Suspense>
      </div>
      <Suspense fallback={<SkeletonSection />}>
        <TrendsSidebar />
      </Suspense>
    </main>
  );
}
