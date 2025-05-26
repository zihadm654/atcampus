import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrendsSidebar from "@/components/feed/TrendsSidebar";
import PostEditor from "@/components/posts/editor/PostEditor";

import FollowingFeed from "../../components/feed/FollowingFeed";
import ForYouFeed from "../../components/feed/ForYouFeed";

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
