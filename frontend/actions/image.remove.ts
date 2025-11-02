"use server";

import { UTApi } from "uploadthing/server";

import { getCurrentUser } from "@/lib/session";

export const imageRemove = async (imageKey: string) => {
  const utapi = new UTApi();
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await utapi.deleteFiles([imageKey]);
    return {
      success: true,
      message: "Image deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      message: "Failed to delete image",
    };
  }
};
export const imgRemove = async (imageKey: string) => {
  const utapi = new UTApi();
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  try {
    await utapi.deleteFiles(imageKey);
    return {
      success: true,
      status: 401,
    };
  } catch (_error) {
    return { success: false };
  }
};
