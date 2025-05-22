"use client";

import { useState } from "react";
import Image from "next/image";
import { addPost } from "@/actions/actions";
import { User } from "@/generated/prisma";
import { Smile } from "lucide-react";

import { UserAvatar } from "../shared/user-avatar";
import AddPostButton from "./addPostButton";

const AddPost = ({ user }: { user: User }) => {
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState<any>("");
  return (
    <div className="flex justify-between gap-4 rounded-lg p-4 text-sm shadow-md">
      {/* AVATAR */}
      {user ? <UserAvatar user={user} /> : null}
      {/* POST */}
      <div className="flex-1">
        {/* TEXT INPUT */}
        <form
          action={(formData) => addPost(formData, img?.secure_url || "")}
          className="flex gap-4"
        >
          <textarea
            placeholder="What's on your mind?"
            className="flex-1 rounded-lg border p-2"
            name="desc"
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
          <div className="">
            <Smile className="size-6" />
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
