"use server";

import { AttendanceStatus, EventStatus, type EventType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { notifyEventCapacityReached } from "@/lib/services/notification-service";
import { getCurrentUser } from "@/lib/session";
import {
  createEventSchema,
  eventLikeSchema,
  joinEventSchema,
  type TCreateEvent,
  type TEventLike,
  type TJoinEvent,
  type TUpdateEvent,
  updateEventSchema,
} from "@/lib/validations/event";
import type { EventWithDetails, ExtendedEvent } from "@/types/event-types";

// Helper function to get event with details
function getEventInclude(userId?: string) {
  return {
    creator: {
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        email: true,
      },
    },
    organization: {
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
      },
    },
    faculty: {
      select: {
        id: true,
        name: true,
        shortName: true,
      },
    },
    attendees: {
      where: { status: { not: AttendanceStatus.CANCELLED } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            email: true,
          },
        },
      },
    },
    likesUsers: userId
      ? {
          where: { userId },
          take: 1,
        }
      : false,
    _count: {
      select: {
        attendees: {
          where: { status: { not: AttendanceStatus.CANCELLED } },
        },
        likesUsers: true,
      },
    },
  };
}

// Create event - Institution users only
export async function createEventAction(
  data: TCreateEvent,
): Promise<{ success: boolean; data?: ExtendedEvent; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user is an institution
    if (user.role !== "INSTITUTION") {
      return { success: false, error: "Only institutions can create events" };
    }

    // Validate input data
    const validatedData = createEventSchema.parse(data);

    // Create the event
    const event = await prisma.event.create({
      data: {
        ...validatedData,
        creatorId: user.id,
        status: EventStatus.DRAFT,
      },
      include: getEventInclude(user.id),
    });

    revalidatePath("/events");
    revalidatePath("/profile/[username]");

    return { success: true, data: event as unknown as ExtendedEvent };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

// Get events with filtering
export async function getEventsAction(
  filters: {
    organizationId?: string;
    facultyId?: string;
    status?: EventStatus;
    type?: EventType;
    isPublic?: boolean;
    startDateFrom?: Date;
    startDateTo?: Date;
    search?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<{
  success: boolean;
  data?: ExtendedEvent[];
  total?: number;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const {
      organizationId,
      facultyId,
      status,
      type,
      isPublic = true,
      startDateFrom,
      startDateTo,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {
      isActive: true,
      ...(status && { status }),
      ...(type && { type }),
      ...(organizationId && { organizationId }),
      ...(facultyId && { facultyId }),
      ...(isPublic !== undefined && { isPublic }),
      ...(startDateFrom && { startDate: { gte: startDateFrom } }),
      ...(startDateTo && { startDate: { lte: startDateTo } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: getEventInclude(user.id),
        orderBy: { startDate: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return { success: true, data: events as unknown as ExtendedEvent[], total };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

// Get single event with details
export async function getEventByIdAction(
  eventId: string,
): Promise<{ success: boolean; data?: EventWithDetails; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: getEventInclude(user.id),
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event as unknown as EventWithDetails };
  } catch (error) {
    console.error("Error fetching event:", error);
    return { success: false, error: "Failed to fetch event" };
  }
}

// Update event - Only creator can update
export async function updateEventAction(
  eventId: string,
  data: TUpdateEvent,
): Promise<{ success: boolean; data?: ExtendedEvent; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input data
    const validatedData = updateEventSchema.parse(data);

    // Check if event exists and user is the creator
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return { success: false, error: "Event not found" };
    }

    if (existingEvent.creatorId !== user.id) {
      return {
        success: false,
        error: "Only the event creator can update this event",
      };
    }

    // Update the event
    const event = await prisma.event.update({
      where: { id: eventId },
      data: validatedData,
      include: getEventInclude(user.id),
    });

    revalidatePath("/events");
    revalidatePath("/profile/[username]");

    return { success: true, data: event as unknown as ExtendedEvent };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

// Delete event - Only creator can delete
export async function deleteEventAction(
  eventId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if event exists and user is the creator
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return { success: false, error: "Event not found" };
    }

    if (existingEvent.creatorId !== user.id) {
      return {
        success: false,
        error: "Only the event creator can delete this event",
      };
    }

    // Soft delete the event
    await prisma.event.update({
      where: { id: eventId },
      data: { isActive: false },
    });

    revalidatePath("/events");
    revalidatePath("/profile/[username]");

    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}

// Join event - Students can join events
export async function joinEventAction(
  data: TJoinEvent,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input data
    const validatedData = joinEventSchema.parse(data);

    // Check if event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    if (!event.isActive || event.status !== EventStatus.PUBLISHED) {
      return {
        success: false,
        error: "Event is not available for registration",
      };
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return { success: false, error: "Registration deadline has passed" };
    }

    // Check if event is full
    const attendeeCount = await prisma.eventAttendee.count({
      where: {
        eventId: validatedData.eventId,
        status: { not: AttendanceStatus.CANCELLED },
      },
    });

    if (event.maxAttendees && attendeeCount >= event.maxAttendees) {
      return { success: false, error: "Event is full" };
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventAttendee.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: validatedData.eventId,
        },
      },
    });

    if (
      existingRegistration &&
      existingRegistration.status !== AttendanceStatus.CANCELLED
    ) {
      return {
        success: false,
        error: "You are already registered for this event",
      };
    }

    // Create or update registration
    if (existingRegistration) {
      await prisma.eventAttendee.update({
        where: { id: existingRegistration.id },
        data: {
          status: AttendanceStatus.REGISTERED,
          notes: validatedData.registrationNote,
          registeredAt: new Date(),
        },
      });
    } else {
      await prisma.eventAttendee.create({
        data: {
          userId: user.id,
          eventId: validatedData.eventId,
          status: AttendanceStatus.REGISTERED,
          notes: validatedData.registrationNote,
        },
      });
    }

    // Check if event is near capacity and send notification to creator
    const newAttendeeCount = attendeeCount + 1;
    if (event.maxAttendees && newAttendeeCount >= event.maxAttendees * 0.9) {
      await notifyEventCapacityReached(event.id);
    }

    revalidatePath("/events");
    revalidatePath("/profile/[username]");

    return { success: true };
  } catch (error) {
    console.error("Error joining event:", error);
    return { success: false, error: "Failed to join event" };
  }
}

// Leave event - Students can leave events
export async function leaveEventAction(
  eventId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Find the user's registration
    const registration = await prisma.eventAttendee.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
    });

    if (!registration) {
      return { success: false, error: "You are not registered for this event" };
    }

    // Update registration status to cancelled
    await prisma.eventAttendee.update({
      where: { id: registration.id },
      data: { status: AttendanceStatus.CANCELLED },
    });

    revalidatePath("/events");
    revalidatePath("/profile/[username]");

    return { success: true };
  } catch (error) {
    console.error("Error leaving event:", error);
    return { success: false, error: "Failed to leave event" };
  }
}

// Like/unlike event
export async function toggleEventLikeAction(
  data: TEventLike,
): Promise<{ success: boolean; isLiked?: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input data
    const validatedData = eventLikeSchema.parse(data);

    // Check if like exists
    const existingLike = await prisma.eventLike.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: validatedData.eventId,
        },
      },
    });

    if (existingLike) {
      // Unlike the event
      await prisma.eventLike.delete({
        where: { id: existingLike.id },
      });

      revalidatePath("/events");
      revalidatePath("/profile/[username]");

      return { success: true, isLiked: false };
    }
    // Like the event
    await prisma.eventLike.create({
      data: {
        userId: user.id,
        eventId: validatedData.eventId,
      },
    });

    revalidatePath("/events");
    revalidatePath("/profile/[username]");

    return { success: true, isLiked: true };
  } catch (error) {
    console.error("Error toggling event like:", error);
    return { success: false, error: "Failed to toggle event like" };
  }
}

// Get user's events
export async function getUserEventsAction(
  userId: string,
): Promise<{ success: boolean; data?: ExtendedEvent[]; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Get events created by the user
    const createdEvents = await prisma.event.findMany({
      where: {
        creatorId: userId,
        isActive: true,
      },
      include: getEventInclude(currentUser.id),
      orderBy: { startDate: "desc" },
    });

    // Get events the user is attending
    const attendingEvents = await prisma.event.findMany({
      where: {
        attendees: {
          some: {
            userId,
            status: { not: AttendanceStatus.CANCELLED },
          },
        },
        isActive: true,
      },
      include: getEventInclude(currentUser.id),
      orderBy: { startDate: "asc" },
    });

    return {
      success: true,
      data: [
        ...createdEvents,
        ...attendingEvents,
      ] as unknown as ExtendedEvent[],
    };
  } catch (error) {
    console.error("Error fetching user events:", error);
    return { success: false, error: "Failed to fetch user events" };
  }
}
