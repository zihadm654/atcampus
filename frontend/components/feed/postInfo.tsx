"use client";

import { deletePost } from "@/actions/actions";
import { Ellipsis } from "lucide-react";
import { useState } from "react";

const PostInfo = ({ postId }: { postId: string }) => {
  const [open, setOpen] = useState(false);

  const deletePostWithId = deletePost.bind(null, postId);
  return (
    <div className="relative">
      <Ellipsis className="size-6 cursor-pointer" onClick={() => setOpen((prev) => !prev)}/> 
      {open && (
        <div className="absolute top-4 right-0 p-4 w-32 rounded-lg flex flex-col gap-2 text-xs shadow-lg z-30">
          <span className="cursor-pointer">View</span>
          <span className="cursor-pointer">Re-post</span>
          <form action={deletePostWithId}>
            <button className="text-red-500">Delete</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostInfo;
