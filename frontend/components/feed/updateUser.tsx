"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/actions/actions";
import { User } from "@/generated/prisma";

// import UpdateButton from "./UpdateButton";

const UpdateUser = ({ user }: { user: User }) => {
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState<any>(false);

  const [state, formAction] = useActionState(updateProfile, {
    success: false,
    error: false,
  });

  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    state.success && router.refresh();
  };

  return (
    <div className="">
      <span
        className="cursor-pointer text-xs text-blue-500"
        onClick={() => setOpen(true)}
      >
        Update
      </span>
      {open && (
        <div className="absolute top-0 left-0 z-50 flex h-screen w-screen items-center justify-center">
          <form
            action={(formData) =>
              formAction({ formData, cover: cover?.secure_url || "" })
            }
            className="relative flex w-full flex-col gap-2 rounded-lg p-12 shadow-md md:w-1/2 xl:w-1/3"
          >
            {/* TITLE */}
            <h1>Update Profile</h1>
            <div className="mt-4 text-xs text-gray-500">
              Use the navbar profile to change the avatar or username.
            </div>
            {/* COVER PIC UPLOAD */}
            {/* <CldUploadWidget
              uploadPreset="social"
              onSuccess={(result) => setCover(result.info)}
            >
              {({ open }) => {
                return (
                  <div
                    className="flex flex-col gap-4 my-4"
                    onClick={() => open()}
                  >
                    <label htmlFor="">Cover Picture</label>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Image
                        src={user.cover || "/noCover.png"}
                        alt=""
                        width={48}
                        height={32}
                        className="w-12 h-8 rounded-md object-cover"
                      />
                      <span className="text-xs underline text-gray-600">
                        Change
                      </span>
                    </div>
                  </div>
                );
              }}
            </CldUploadWidget> */}

            {/* WRAPPER */}
            <div className="flex flex-wrap justify-between gap-2 xl:gap-4">
              {/* INPUT */}
              <div className="flex flex-col gap-4">
                <label htmlFor="" className="text-xs text-gray-500">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder={user.name || "John"}
                  className="rounded-md p-[13px] text-sm ring-1 ring-gray-300"
                  name="name"
                />
              </div>
              {/* INPUT */}
              <div className="flex flex-col gap-4">
                <label htmlFor="" className="text-xs text-gray-500">
                  Description
                </label>
                <input
                  type="text"
                  placeholder={user.bio || "Life is beautiful..."}
                  className="rounded-md p-[13px] text-sm ring-1 ring-gray-300"
                  name="description"
                />
              </div>
              {/* INPUT */}

              <div className="flex flex-col gap-4">
                <label htmlFor="" className="text-xs text-gray-500">
                  Website
                </label>
                <input
                  type="text"
                  placeholder={user.website || "https://example.com"}
                  className="rounded-md p-[13px] text-sm ring-1 ring-gray-300"
                  name="website"
                />
              </div>
            </div>
            {/* <UpdateButton/> */}
            {state.success && (
              <span className="text-green-500">Profile has been updated!</span>
            )}
            {state.error && (
              <span className="text-red-500">Something went wrong!</span>
            )}
            <div
              className="absolute top-3 right-2 cursor-pointer text-xl"
              onClick={handleClose}
            >
              X
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateUser;
