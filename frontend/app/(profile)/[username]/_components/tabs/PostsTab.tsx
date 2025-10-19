import { Icons } from "@/components/shared/icons";
import UserPosts from "../UserPosts";

interface PostsTabProps {
  user: any;
  permissions: any;
}

export default function PostsTab({ user }: PostsTabProps) {
  return (
    <>
      <h2 className="mb-3 flex items-center font-medium text-xl">
        <Icons.post className="mr-2 size-5" />
        {user.name}&apos;s posts
      </h2>
      <UserPosts userId={user.id} />
    </>
  );
}
