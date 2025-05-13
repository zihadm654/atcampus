import Image from "next/image";
import { prisma } from "@/lib/db";
import CommentList from "./commentList";

const Comments = async ({postId}:{postId:string}) => {

  const comments = await prisma.comment.findMany({
    where:{
      postId,
    },
    include:{
      user:true
    }
  })
  return (
    <div className="">
      {/* WRITE */}
      <CommentList comments={comments} postId={postId}/>
    </div>
  );
};

export default Comments;
