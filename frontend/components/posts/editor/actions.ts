"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { createPostSchema } from "@/lib/validations/validation";
import { getPostDataInclude } from "@/types/types";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const user = await getCurrentUser();

  if (!user) throw new Error("Unauthorized");

  const { content, mediaIds } = createPostSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
