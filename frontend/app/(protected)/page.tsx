import { constructMetadata } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "@/components/feed/FollowingFeed";
import ForYouFeed from "@/components/feed/ForYouFeed";
import TrendsSidebar from "@/components/feed/TrendsSidebar";
import PostEditor from "@/components/posts/editor/PostEditor";

export const metadata = constructMetadata({
  title: "Home - AtCampus",
  description: "Explore atCampus feed for knowledge.",
});

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <Tabs defaultValue="for-you">
          <TabsList>
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
