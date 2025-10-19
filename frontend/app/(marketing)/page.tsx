import { Suspense } from "react";
import ForYouFeed from "@/components/feed/ForYouFeed";
import PostEditor from "@/components/posts/editor/PostEditor";
import { SkeletonSection } from "@/components/shared/section-skeleton";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Home - AtCampus",
  description: "Explore atCampus feed for knowledge.",
});

export default function Home() {
  return (
    <div className="w-full min-w-0 space-y-5">
      <Suspense fallback={<SkeletonSection />}>
        <PostEditor />
      </Suspense>
      <Suspense fallback={<SkeletonSection />}>
        <ForYouFeed />
      </Suspense>
    </div>
  );
}
