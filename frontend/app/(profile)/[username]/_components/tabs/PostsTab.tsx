import React from 'react';
import { Icons } from "@/components/shared/icons";
import UserPosts from "../UserPosts";

interface PostsTabProps {
  user: any;
  permissions: any;
}

export default function PostsTab({ user }: PostsTabProps) {
  return (
    <>
      <h2 className="mb-3 flex items-center text-xl font-medium">
        <Icons.post className="size-5 mr-2" />
        {user.name}&apos;s posts
      </h2>
      <UserPosts userId={user.id} />
    </>
  );
}