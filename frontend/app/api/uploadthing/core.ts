import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import streamServerClient from "@/lib/stream";

const f = createUploadthing();
export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");

      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.image;

      if (oldAvatarUrl) {
        // Assuming the new URL format is /a/{key}
        const key = oldAvatarUrl.split("/a/")[1];

        await new UTApi().deleteFiles(key);
      }

      const newAvatarUrl = file.url.replace("/f/", "/a/");

      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: {
            image: newAvatarUrl,
          },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: {
            image: newAvatarUrl,
          },
        }),
      ]);

      return { avatarUrl: newAvatarUrl };
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await getCurrentUser();

      if (!user) throw new UploadThingError("Unauthorized");

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.media.create({
        data: {
          url: file.url.replace("/f/", "/a/"),
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
