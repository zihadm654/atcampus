"use client";

import Image from "next/image";
import { useState } from "react";
import AddPostButton from "./addPostButton";
import { addPost } from "@/actions/actions";
import { ExtendedUser } from "@/types/next-auth";
import { UserAvatar } from "../shared/user-avatar";
import { Smile } from "lucide-react";

const AddPost = ({user}:{user:any}) => {
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState<any>();
  return (
    <div className="p-4 shadow-md rounded-lg flex gap-4 justify-between text-sm">
      {/* AVATAR */}
      <UserAvatar user={user} />
      {/* POST */}
      <div className="flex-1">
        {/* TEXT INPUT */}
        <form action={(formData)=>addPost(formData,img?.secure_url || "")} className="flex gap-4">
          <textarea
            placeholder="What's on your mind?"
            className="flex-1 rounded-lg p-2 border"
            name="desc"
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
          <div className="">
            <Smile className="size-6"/>
            <AddPostButton />
          </div>
        </form>
        {/* POST OPTIONS */}
        {/* <div className="flex items-center gap-4 mt-4 text-gray-400 flex-wrap">
          <CldUploadWidget
            uploadPreset="social"
            onSuccess={(result, { widget }) => {
              setImg(result.info);
              widget.close();
            }}
          >
            {({ open }) => {
              return (
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => open()}
                >
                  <Image src="/addimage.png" alt="" width={20} height={20} />
                  Photo
                </div>
              );
            }}
          </CldUploadWidget>
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/addVideo.png" alt="" width={20} height={20} />
            Video
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/poll.png" alt="" width={20} height={20} />
            Poll
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src="/addevent.png" alt="" width={20} height={20} />
            Event
          </div> 
        </div>
          */}
      </div>
    </div>
  );
};

export default AddPost;
