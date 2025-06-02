import { Suspense } from "react";

import { constructMetadata } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "@/components/feed/FollowingFeed";
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
        <Tabs defaultValue="for-you">
          <TabsList>
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <Suspense fallback={<SkeletonSection />}>
              <ForYouFeed />
            </Suspense>
          </TabsContent>
          <Suspense fallback={<SkeletonSection />}>
            <TabsContent value="following">
              <FollowingFeed />
            </TabsContent>
          </Suspense>
        </Tabs>
      </div>
      <Suspense fallback={<SkeletonSection />}>
        <TrendsSidebar />
      </Suspense>
    </main>
  );
}
