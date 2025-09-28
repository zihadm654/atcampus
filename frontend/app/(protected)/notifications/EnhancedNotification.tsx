import React, { JSX } from "react";
import Link from "next/link";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, User2, Users, Calendar, Bell, Award, BookOpen, Briefcase } from "lucide-react";

import { NotificationData } from "@/types/types";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/UserAvatar";

interface NotificationProps {
  notification: NotificationData;
}

export default function EnhancedNotification({ notification }: NotificationProps) {
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string; color?: string }
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayUsername} followed you`,
      icon: <User2 className="text-primary size-7" />,
      href: `/${notification.issuer.username}`,
      color: "text-blue-500"
    },
    COMMENT: {
      message: `${notification.issuer.displayUsername} commented on your post`,
      icon: <MessageCircle className="fill-primary text-primary size-7" />,
      href: `/posts/${notification.postId}`,
      color: "text-green-500"
    },
    LIKE: {
      message: `${notification.issuer.displayUsername} liked your post`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${notification.postId}`,
      color: "text-red-500"
    },
    POST: {
      message: `${notification.issuer.displayUsername} mentioned you in a post`,
      icon: <Bell className="size-7 fill-purple-500 text-purple-500" />,
      href: `/posts/${notification.postId}`,
      color: "text-purple-500"
    },
    JOB_APPLICATION: {
      message: `${notification.issuer.displayUsername} applied to your job posting`,
      icon: <Briefcase className="size-7 fill-blue-500 text-blue-500" />,
      href: `/jobs/${notification.jobId}`,
      color: "text-blue-500"
    },
    COURSE_ENROLLMENT: {
      message: `${notification.issuer.displayUsername} enrolled in your course`,
      icon: <BookOpen className="size-7 fill-green-500 text-green-500" />,
      href: `/courses/${notification.courseId}`,
      color: "text-green-500"
    },
    RESEARCH_COLLABORATION: {
      message: `${notification.issuer.displayUsername} wants to collaborate on research`,
      icon: <Award className="size-7 fill-yellow-500 text-yellow-500" />,
      href: `/researches/${notification.researchId}`,
      color: "text-yellow-500"
    },
    SYSTEM_ANNOUNCEMENT: {
      message: "System announcement",
      icon: <Bell className="size-7 fill-orange-500 text-orange-500" />,
      href: "/notifications/system",
      color: "text-orange-500"
    },
    PROFESSOR_INVITATION: {
      message: "You have been invited to join as a professor",
      icon: <Award className="size-7 fill-purple-500 text-purple-500" />,
      href: "/profile/invitations",
      color: "text-purple-500"
    },
    COURSE_APPROVAL_REQUEST: {
      message: "Course approval request pending",
      icon: <BookOpen className="size-7 fill-orange-500 text-orange-500" />,
      href: "/dashboard/admin/courses",
      color: "text-orange-500"
    },
    COURSE_APPROVAL_RESULT: {
      message: "Course approval result available",
      icon: <Award className="size-7 fill-green-500 text-green-500" />,
      href: "/courses/my-courses",
      color: "text-green-500"
    }
  };

  const { message, icon, href, color } = notificationTypeMap[notification.type];

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "bg-card hover:bg-card/70 flex gap-3 rounded-2xl p-5 shadow-sm transition-colors relative",
          !notification.read && "bg-primary/5 border-l-4 border-primary"
        )}
      >
        {!notification.read && (
          <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full"></div>
        )}
        
        <div className="flex-shrink-0">
          <UserAvatar avatarUrl={notification.issuer.image} size={36} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn("flex-shrink-0", color)}>
              {icon}
            </div>
            <span className="font-bold text-sm truncate">
              {notification.issuer.displayUsername}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            {message}
          </p>
          
          {notification.post && (
            <div className="text-muted-foreground text-sm line-clamp-2 whitespace-pre-line bg-muted/50 rounded-lg p-3">
              {notification.post.content}
            </div>
          )}
          
          {notification.job && (
            <div className="text-muted-foreground text-sm bg-muted/50 rounded-lg p-3">
              <p className="font-medium">{notification.job.title}</p>
            </div>
          )}
          
          {notification.courseId && (
            <div className="text-muted-foreground text-sm bg-muted/50 rounded-lg p-3">
              <p className="font-medium">Course Update</p>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-2">
            {new Date(notification.createdAt).toLocaleString()}
          </div>
        </div>
      </article>
    </Link>
  );
}