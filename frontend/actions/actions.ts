"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const switchFollow = async (userId: string) => {
  const session = await auth();

  if (!session?.user) {
    throw new Error("User is not authenticated!");
  }

  try {
    const existingFollow = await prisma.follower.findFirst({
      where: {
        followerId: session.user.id,
        followingId: userId,
      },
    });

    if (existingFollow) {
      await prisma.follower.delete({
        where: {
          id: existingFollow.id,
        },
      });
      return {message: "Unfollowed"}
    } else {
      const existingFollowRequest = await prisma.followRequest.findFirst({
        where: {
          senderId: session.user.id,
          receiverId: userId,
        },
      });

      if (existingFollowRequest) {
        await prisma.followRequest.delete({
          where: {
            id: existingFollowRequest.id,
          },
        });
        return {message: "deleted follow request"}
      } else {
        await prisma.followRequest.create({
          data: {
            senderId: session.user.id!,
            receiverId: userId,
          },
        });
        return {message: "sent follow request"}
      }
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const switchBlock = async (userId: string) => {
  const session =await auth();

  if (!session?.user) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingBlock = await prisma.block.findFirst({
      where: {
        blockerId: session.user.id,
        blockedId: userId,
      },
    });

    if (existingBlock) {
      await prisma.block.delete({
        where: {
          id: existingBlock.id,
        },
      });
    } else {
      await prisma.block.create({
        data: {
          blockerId: session.user.id!,
          blockedId: userId,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const acceptFollowRequest = async (userId: string) => {
  const session = await auth();

  if (!session?.user) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingFollowRequest = await prisma.followRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: session.user.id,
      },
    });

    if (existingFollowRequest) {
      await prisma.followRequest.delete({
        where: {
          id: existingFollowRequest.id,
        },
      });

      await prisma.follower.create({
        data: {
          followerId: userId,
          followingId: session.user.id!,
        },
      });
    }
    revalidatePath('/')
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};
export const existingFollowRequest= async (userId: string) => {
  const session = await auth();

  if (!session?.user) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingFollow = await prisma.followRequest.findFirst({
      where: {
        senderId: session.user.id,
        receiverId: userId,
      },
    });

    if (existingFollow) {
      const alreadyFollowed= await prisma.follower.findFirst({
        where: {
          id: existingFollow.id,
        },
      });
      return alreadyFollowed
    }
  }
  catch(err){
    console.log(err);
    throw new Error("Something went wrong!");
  }
}
export const declineFollowRequest = async (userId: string) => {
  const session = await auth();

  if (!session?.user) {
    throw new Error("User is not Authenticated!!");
  }

  try {
    const existingFollowRequest = await prisma.followRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: session.user.id,
      },
    });

    if (existingFollowRequest) {
      await prisma.followRequest.delete({
        where: {
          id: existingFollowRequest.id,
        },
      });
    }
    revalidatePath('/')
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const updateProfile = async (
  prevState: { success: boolean; error: boolean },
  payload: { formData: FormData; cover: string }
) => {
  const { formData, cover } = payload;
  const fields = Object.fromEntries(formData);

  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([_, value]) => value !== "")
  );

  const Profile = z.object({
    coverImage: z.string().optional(),
    name: z.string().max(60).optional(),
    bio: z.string().max(255).optional(),
    website: z.string().max(60).optional(),
  });

  const validatedFields = Profile.safeParse({ cover, ...filteredFields });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: true };
  }

  const session= await auth()

  if (!session?.user) {
    return { success: false, error: true };
  }

  try {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: validatedFields.data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const switchLike = async (postId: string) => {
  const session= await auth()

  if (!session?.user) throw new Error("User is not authenticated!");

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId: session.user.id,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId:session.user.id!,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong");
  }
};

export const addComment = async (postId: string, desc: string) => {
  const session= await auth()

  if (!session) throw new Error("User is not authenticated!");

  try {
    const createdComment = await prisma.comment.create({
      data: {
        desc,
        userId:session.user.id!,
        postId,
      },
      include: {
        user: true,
      },
    });

    return createdComment;
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const addPost = async (formData: FormData, img: string) => {
  const desc = formData.get("desc") as string;

  const Desc = z.string().min(1).max(255);

  const validatedDesc = Desc.safeParse(desc);

  if (!validatedDesc.success) {
    //TODO
    console.log("description is not valid");
    return;
  }
  const session= await auth()

  if (!session) throw new Error("User is not authenticated!");

  try {
    await prisma.post.create({
      data: {
        desc: validatedDesc.data,
        userId:session.user.id!,
        img,
      },
    });

    revalidatePath("/");
  } catch (err) {
    console.log(err);
  }
};

export const addStory = async (img: string) => {
  const session= await auth()

  if (!session) throw new Error("User is not authenticated!");

  try {
    const existingStory = await prisma.story.findFirst({
      where: {
        userId:session.user.id,
      },
    });

    if (existingStory) {
      await prisma.story.delete({
        where: {
          id: existingStory.id,
        },
      });
    }
    const createdStory = await prisma.story.create({
      data: {
        userId:session.user.id!,
        img,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      include: {
        user: true,
      },
    });

    return createdStory;
  } catch (err) {
    console.log(err);
  }
};

export const deletePost = async (postId: string) => {
  const session= await auth()

  if (!session) throw new Error("User is not authenticated!");

  try {
    await prisma.post.delete({
      where: {
        id: postId,
        userId:session.user.id,
      },
    });
    revalidatePath("/")
  } catch (err) {
    console.log(err);
  }
};
