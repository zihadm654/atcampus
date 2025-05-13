import { getCurrentUser } from "@/lib/session";
import WhoToFollow from "@/components/feed/WhoToFollow";
import FriendRequests from "@/components/feed/friendRequests";
import Feed from "@/components/feed/feed";
import AddPost from "@/components/feed/addPost";

export default async function IndexPage() {
  const user = await getCurrentUser();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
      <div className="lg:col-span-6 py-2">
        <AddPost user={user}/>
        <div className="space-y-6">
          <Feed/>
      </div>

      </div>
      <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-2">
        <FriendRequests/>
        <WhoToFollow />
      </div>
    </div>
  );
}