'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { userNameSchema } from '@/lib/validations/user';

export type FormData = {
  name: string;
};

export async function updateUserName(userId: string, data: FormData) {
  try {
    const session = await getCurrentUser();

    if (!session || session?.id !== userId) {
      throw new Error('Unauthorized');
    }

    const { name } = userNameSchema.parse(data);

    // Update the user name.
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
      },
    });

    revalidatePath('/dashboard/settings');
    return { status: 'success' };
  } catch (_error) {
    // console.log(error)
    return { status: 'error' };
  }
}
