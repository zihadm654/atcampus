import { prisma } from "@/lib/prisma";
import { notifyEventReminder } from "@/lib/services/notification-service";

export async function sendEventReminders() {
  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Find events starting within 24 hours
    const upcomingEvents = await prisma.event.findMany({
      where: {
        startDate: {
          gte: reminderTime,
          lt: new Date(reminderTime.getTime() + 60 * 60 * 1000), // Within 1 hour window
        },
        status: "PUBLISHED",
        isActive: true,
        reminderSent: false, // Only send once
      },
      include: {
        attendees: {
          where: {
            status: "REGISTERED",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Send reminders for each event
    for (const event of upcomingEvents) {
      for (const attendee of event.attendees) {
        await notifyEventReminder(event.id, attendee.user.id);
      }

      // Mark reminder as sent
      await prisma.event.update({
        where: { id: event.id },
        data: { reminderSent: true },
      });
    }

    console.log(`Sent reminders for ${upcomingEvents.length} events`);
    return { success: true, count: upcomingEvents.length };
  } catch (error) {
    console.error("Error sending event reminders:", error);
    return { success: false, error: "Failed to send event reminders" };
  }
}

export async function resetEventReminders() {
  try {
    // Reset reminder flags for past events
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    await prisma.event.updateMany({
      where: {
        startDate: {
          lt: yesterday,
        },
        reminderSent: true,
      },
      data: { reminderSent: false },
    });

    console.log("Reset event reminder flags");
    return { success: true };
  } catch (error) {
    console.error("Error resetting event reminders:", error);
    return { success: false, error: "Failed to reset event reminders" };
  }
}
