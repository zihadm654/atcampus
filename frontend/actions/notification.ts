// "use server";

// import { prisma } from "@/lib/db";
// import { getCurrentUser } from "@/lib/session";

// export async function getNotifications() {
//   try {
//     const session = await getCurrentUser();
//     if (!session?.id) return;

//     const notifications = await prisma.notification.findMany({
//       where: {
//         userId: session.id,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             image: true,
//           },
//         },
//         post: {
//           select: {
//             id: true,
//             desc: true,
//             img: true,
//           },
//         },
//         comment: {
//           select: {
//             id: true,
//             desc: true,
//             createdAt: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return notifications;
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     throw new Error("Failed to fetch notifications");
//   }
// }

// export async function markNotificationsAsRead(notificationIds: string[]) {
//   try {
//     await prisma.notification.updateMany({
//       where: {
//         id: {
//           in: notificationIds,
//         },
//       },
//       data: {
//         read: true,
//       },
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error marking notifications as read:", error);
//     return { success: false };
//   }
// }
