import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import streamServerClient from "@/lib/stream";

const f = createUploadthing();

// Cleanup function for failed uploads
const cleanupFailedUpload = async (fileUrl: string | null) => {
  if (fileUrl) {
    try {
      const key = fileUrl.split(
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      )[1];
      await new UTApi().deleteFiles(key);
    } catch (error) {
      console.error("Failed to cleanup file:", error);
    }
  }
};
// Simplified file router with built-in validation and modern patterns
export const ourFileRouter = {
  // Avatar upload - simplified with built-in image validation
  avatar: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id, oldImageUrl: user.image };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const oldAvatarUrl = metadata.oldImageUrl;

        if (oldAvatarUrl) {
          await cleanupFailedUpload(oldAvatarUrl);
        }

        // Replace file.url with file.ufsUrl
        const newAvatarUrl = file.ufsUrl;

        await Promise.all([
          prisma.user.update({
            where: { id: metadata.userId },
            data: { image: newAvatarUrl },
          }),
          streamServerClient.partialUpdateUser({
            id: metadata.userId,
            set: { image: newAvatarUrl },
          }),
        ]);

        return { avatarUrl: newAvatarUrl };
      } catch (_error) {
        await cleanupFailedUpload(file.ufsUrl); // Update cleanup to use ufsUrl
        throw new UploadThingError("Failed to update avatar");
      }
    }),
  coverImage: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id, oldCoverUrl: user.coverImage };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // Fetch the user from the database to get the current coverImage
        const oldCoverUrl = metadata?.oldCoverUrl;

        if (oldCoverUrl) {
          await cleanupFailedUpload(oldCoverUrl);
        }

        const newCoverUrl = file.ufsUrl;

        await prisma.user.update({
          where: { id: metadata.userId },
          data: { coverImage: newCoverUrl },
        });

        return { coverImageUrl: newCoverUrl };
      } catch (_error) {
        await cleanupFailedUpload(file.ufsUrl);
        throw new UploadThingError("Failed to update cover image");
      }
    }),
  pdfAttachment: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.media.create({
        data: {
          url: file.ufsUrl, // Replace with ufsUrl,
          type: "PDF",
        },
      });

      return { mediaId: media.id };
    }),

  // School logo (institution only)
  schoolLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");
      if (user.role === "INSTITUTION") {
        throw new UploadThingError("Only institutions can upload school logos");
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { schoolLogoUrl: file.ufsUrl };
    }),

  // School cover image (institution only)
  schoolCoverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");
      if (user.role === "INSTITUTION") {
        throw new UploadThingError(
          "Only institutions can upload school cover images",
        );
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { schoolCoverImageUrl: file.ufsUrl };
    }),

  // course cover image (institution only)
  courseCoverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");
      if (user.role !== "INSTITUTION" && user.role !== "PROFESSOR") {
        throw new UploadThingError(
          "Only institutions can upload school cover images",
        );
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { courseCoverImageUrl: file.ufsUrl };
    }),
  // General attachments (images and videos)
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.media.create({
        data: {
          url: file.ufsUrl,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
