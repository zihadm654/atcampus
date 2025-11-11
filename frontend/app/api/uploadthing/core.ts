import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import streamServerClient from "@/lib/stream";

const f = createUploadthing();

// Define allowed MIME types
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
];

const allowedCoverImageTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
];

const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
// const allowedPdfTypes = ["application/pdf"];

// Validation schema for file metadata
const fileMetadataSchema = z.object({
  size: z.number().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
});

// Cleanup function for failed uploads
const cleanupFailedUpload = async (fileUrl: string | null) => {
  if (fileUrl) {
    try {
      const key = fileUrl.split(
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
      )[1];
      await new UTApi().deleteFiles(key);
    } catch (error) {
      console.error("Failed to cleanup file:", error);
    }
  }
};

export const ourFileRouter = {
  avatar: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ files }) => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");

      try {
        // Validate file metadata
        const metadata = fileMetadataSchema.parse(files[0]);

        // Validate image type
        if (!allowedImageTypes.includes(metadata.type)) {
          throw new UploadThingError(
            "Invalid file type. Only JPEG, PNG, GIF, WebP, and HEIC images are allowed."
          );
        }

        return { user };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new UploadThingError("Invalid file metadata");
        }
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Avatar upload completed", { metadata, file });
        const oldAvatarUrl = metadata.user.image;

        if (oldAvatarUrl) {
          await cleanupFailedUpload(oldAvatarUrl);
        }

        // Replace file.url with file.ufsUrl
        const newAvatarUrl = file.ufsUrl;

        await Promise.all([
          prisma.user.update({
            where: { id: metadata.user.id },
            data: { image: newAvatarUrl },
          }),
          streamServerClient.partialUpdateUser({
            id: metadata.user.id,
            set: { image: newAvatarUrl },
          }),
        ]);

        return { avatarUrl: newAvatarUrl };
      } catch (_error) {
        console.error("Avatar upload error:", _error);
        await cleanupFailedUpload(file.ufsUrl); // Update cleanup to use ufsUrl
        throw new UploadThingError("Failed to update avatar");
      }
    }),
  coverImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ files }) => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");

      try {
        // Validate file metadata
        const metadata = fileMetadataSchema.parse(files[0]);

        // Validate image type
        if (!allowedCoverImageTypes.includes(metadata.type)) {
          throw new UploadThingError(
            "Invalid file type. Only JPEG, PNG, GIF, WebP, and HEIC images are allowed for cover images."
          );
        }

        return { user };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new UploadThingError("Invalid file metadata");
        }
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Cover image upload completed", { metadata, file });
        // Fetch the user from the database to get the current coverImage
        const dbUser = await prisma.user.findUnique({
          where: { id: metadata.user.id },
          select: { coverImage: true },
        });
        const oldCoverUrl = dbUser?.coverImage;

        if (oldCoverUrl) {
          await cleanupFailedUpload(oldCoverUrl);
        }

        const newCoverUrl = file.ufsUrl;

        await prisma.user.update({
          where: { id: metadata.user.id },
          data: { coverImage: newCoverUrl },
        });

        return { coverImageUrl: newCoverUrl };
      } catch (_error) {
        console.error("Cover image upload error:", _error);
        await cleanupFailedUpload(file.ufsUrl);
        throw new UploadThingError("Failed to update cover image");
      }
    }),
  pdfAttachment: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async ({ files }) => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");

      try {
        const metadata = fileMetadataSchema.parse(files[0]);

        if (metadata.type !== "application/pdf") {
          throw new UploadThingError(
            "Invalid file type. Only PDFs are allowed."
          );
        }

        return { user };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new UploadThingError("Invalid file metadata");
        }
        throw error;
      }
    })
    .onUploadComplete(async ({ file }) => {
      try {
        console.log("Attachment upload completed", { file });
        const media = await prisma.media.create({
          data: {
            url: file.ufsUrl, // Replace with ufsUrl,
            type: "PDF",
          },
        });

        return { mediaId: media.id };
      } catch (_error) {
        console.error("PDF attachment upload error:", _error);
        await cleanupFailedUpload(file.ufsUrl); // Update cleanup to use ufsUrl
        throw new UploadThingError("Failed to create media record");
      }
    }),

  schoolLogo: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ files }) => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");

      // Check if user is an institution
      if (user.role !== "INSTITUTION") {
        throw new UploadThingError("Only institutions can upload school logos");
      }

      try {
        // Validate file metadata
        const metadata = fileMetadataSchema.parse(files[0]);

        // Validate image type
        if (!allowedImageTypes.includes(metadata.type)) {
          throw new UploadThingError(
            "Invalid file type. Only JPEG, PNG, GIF, WebP, and HEIC images are allowed."
          );
        }

        return { user };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new UploadThingError("Invalid file metadata");
        }
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("School logo upload completed", { metadata, file });
        return { schoolLogoUrl: file.ufsUrl };
      } catch (_error) {
        console.error("School logo upload error:", _error);
        await cleanupFailedUpload(file.ufsUrl);
        throw new UploadThingError("Failed to upload school logo");
      }
    }),
  schoolCoverImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ files }) => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");

      // Check if user is an institution
      if (user.role !== "INSTITUTION") {
        throw new UploadThingError(
          "Only institutions can upload school cover images"
        );
      }

      try {
        // Validate file metadata
        const metadata = fileMetadataSchema.parse(files[0]);

        // Validate image type
        if (!allowedCoverImageTypes.includes(metadata.type)) {
          throw new UploadThingError(
            "Invalid file type. Only JPEG, PNG, GIF, WebP, and HEIC images are allowed for cover images."
          );
        }

        return { user };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new UploadThingError("Invalid file metadata");
        }
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("School cover image upload completed", { metadata, file });
        return { schoolCoverImageUrl: file.ufsUrl };
      } catch (_error) {
        console.error("School cover image upload error:", _error);
        await cleanupFailedUpload(file.ufsUrl);
        throw new UploadThingError("Failed to upload school cover image");
      }
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async ({ files }) => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");

      try {
        // Validate file metadata
        const metadata = fileMetadataSchema.parse(files[0]);

        // Validate file type based on content type
        const isImage = metadata.type.startsWith("image/");
        const isVideo = metadata.type.startsWith("video/");

        if (isImage && !allowedImageTypes.includes(metadata.type)) {
          throw new UploadThingError(
            "Invalid image type. Only JPEG, PNG, GIF, WebP, and HEIC images are allowed."
          );
        }

        if (isVideo && !allowedVideoTypes.includes(metadata.type)) {
          throw new UploadThingError(
            "Invalid video type. Only MP4, WebM, and QuickTime videos are allowed."
          );
        }

        if (!(isImage || isVideo)) {
          throw new UploadThingError(
            "Invalid file type. Only images and videos are allowed."
          );
        }

        return { user };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new UploadThingError("Invalid file metadata");
        }
        throw error;
      }
    })
    .onUploadComplete(async ({ file }) => {
      try {
        console.log("General attachment upload completed", { file });
        const media = await prisma.media.create({
          data: {
            url: file.ufsUrl, // Replace with ufsUrl
            type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
          },
        });

        return { mediaId: media.id };
      } catch (_error) {
        console.error("General attachment upload error:", _error);
        await cleanupFailedUpload(file.ufsUrl); // Update cleanup to use ufsUrl
        throw new UploadThingError("Failed to create media record");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
