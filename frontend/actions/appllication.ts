'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { ApplicationStatus, NotificationType } from '@prisma/client';

export const applyJob = async (jobId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    // Check if user already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        applicantId: user.id,
        jobId,
      },
    });
    if (existingApplication) {
      return { success: false, message: 'Already applied to this job.' };
    }

    // Fetch job to get the creator's userId
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { userId: true },
    });
    if (!job) {
      return { success: false, message: 'Job not found.' };
    }
    if (job.userId === user.id) {
      return { success: false, message: 'You cannot apply to your own job.' };
    }

    // Use a transaction to create application and notification atomically
    await prisma.$transaction(async (tx) => {
      await tx.application.create({
        data: {
          applicantId: user.id,
          jobId,
          status: ApplicationStatus.PENDING,
        },
      });
      await tx.notification.create({
        data: {
          issuerId: user.id,
          recipientId: job.userId,
          type: NotificationType.JOB_APPLICATION, // Use a specific type for job applications
          // Optionally add more fields (jobId, message, etc.)
        },
      });
    });
    revalidatePath('/jobs');
    return {
      success: true,
      message: 'Job application submitted successfully.',
    };
  } catch (error) {
    console.error('Error applying for job:', error);
    throw new Error('Failed to apply for job.');
  }
};

export const updateApplicationStatus = async (
  applicationId: string,
  newStatus: ApplicationStatus
) => {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORGANIZATION') throw new Error('Unauthorized');

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!application || application.job.userId !== user.id)
    throw new Error('Unauthorized or application not found');

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus },
  });

  revalidatePath('/dashboard');
  return { success: true, message: 'Status updated successfully.' };
};
