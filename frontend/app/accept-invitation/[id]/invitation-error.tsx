import { AlertCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InvitationErrorProps {
  error?: string;
  type?:
    | "expired"
    | "declined"
    | "invalid"
    | "general"
    | "faculty_not_found"
    | "role_mismatch";
  invitationType?: "professor" | "standard";
}

export function InvitationError({
  error,
  type = "general",
  invitationType = "standard",
}: InvitationErrorProps) {
  // Determine error type from error message if not explicitly provided
  if (!type && error) {
    if (error.includes("expired")) type = "expired";
    else if (error.includes("declined")) type = "declined";
    else if (error.includes("faculty") || error.includes("Faculty"))
      type = "faculty_not_found";
    else if (error.includes("role") || error.includes("Role"))
      type = "role_mismatch";
    else if (error.includes("invalid") || error.includes("not found"))
      type = "invalid";
  }
  const getErrorContent = () => {
    // Handle professor-specific invitation errors
    if (invitationType === "professor") {
      switch (type) {
        case "expired":
          return {
            icon: <Clock className="h-6 w-6 text-orange-600" />,
            title: "Professor Invitation Expired",
            description: "This professor invitation has expired.",
            message:
              "The professor invitation you're trying to access has expired. Professor invitations are valid for 30 days from the time they were sent. Please contact the organization administrator to request a new invitation.",
            titleColor: "text-orange-600",
          };
        case "declined":
          return {
            icon: <XCircle className="h-6 w-6 text-red-600" />,
            title: "Professor Invitation Declined",
            description: "This professor invitation has been declined.",
            message:
              "This professor invitation has already been declined. The organization administrator has been notified. If you changed your mind, please contact them directly to request a new invitation.",
            titleColor: "text-red-600",
          };
        case "invalid":
          return {
            icon: <AlertCircle className="h-6 w-6 text-destructive" />,
            title: "Invalid Professor Invitation",
            description: "This professor invitation link is not valid.",
            message:
              "The professor invitation link you're trying to access is invalid, has been cancelled, or may have already been used. Please check your email for a valid invitation link or contact the organization administrator.",
            titleColor: "text-destructive",
          };
        case "faculty_not_found":
          return {
            icon: <AlertCircle className="h-6 w-6 text-destructive" />,
            title: "Faculty Assignment Error",
            description:
              "The faculty specified in this invitation was not found.",
            message:
              "The faculty that was specified in your professor invitation could not be found. This may be due to organizational changes. Please contact the organization administrator for assistance.",
            titleColor: "text-destructive",
          };
        case "role_mismatch":
          return {
            icon: <AlertCircle className="h-6 w-6 text-destructive" />,
            title: "Account Role Mismatch",
            description:
              "Your account role does not match the invitation requirements.",
            message:
              "This invitation requires a professor account, but your current account has a different role. Please either register a new professor account or contact the organization administrator for assistance.",
            titleColor: "text-destructive",
          };
        default:
          return {
            icon: <AlertCircle className="h-6 w-6 text-destructive" />,
            title: "Professor Invitation Error",
            description: "There was an issue with your professor invitation.",
            message:
              error ||
              "The professor invitation you're trying to access is either invalid or you don't have a professor account or you don't have the correct permissions. Please check your email for a valid invitation or contact the person who sent it.",
            titleColor: "text-destructive",
          };
      }
    }

    // Handle standard invitation errors
    switch (type) {
      case "expired":
        return {
          icon: <Clock className="h-6 w-6 text-orange-600" />,
          title: "Invitation Expired",
          description: "This invitation has expired.",
          message:
            "The invitation you're trying to access has expired. Please contact the organization administrator to request a new invitation.",
          titleColor: "text-orange-600",
        };
      case "declined":
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          title: "Invitation Declined",
          description: "This invitation has been declined.",
          message:
            "This invitation has already been declined. The organization administrator has been notified. If you changed your mind, please contact them directly to request a new invitation.",
          titleColor: "text-red-600",
        };
      case "invalid":
        return {
          icon: <AlertCircle className="h-6 w-6 text-destructive" />,
          title: "Invalid Invitation",
          description: "This invitation link is not valid.",
          message:
            "The invitation link you're trying to access is invalid, has been cancelled, or may have already been used. Please check your email for a valid invitation link or contact the organization administrator.",
          titleColor: "text-destructive",
        };
      default:
        return {
          icon: <AlertCircle className="h-6 w-6 text-destructive" />,
          title: "Invitation Error",
          description: "There was an issue with your invitation.",
          message:
            error ||
            "The invitation you're trying to access is either invalid or you don't have the correct permissions. Please check your email for a valid invitation or contact the person who sent it.",
          titleColor: "text-destructive",
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          {errorContent.icon}
          <CardTitle className={`${errorContent.titleColor} text-xl`}>
            {errorContent.title}
          </CardTitle>
        </div>
        <CardDescription>{errorContent.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground text-sm">
          {errorContent.message}
        </p>

        {type === "expired" && (
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-orange-800 text-sm">
              <strong>Need a new professor invitation?</strong> Contact the
              organization administrator who sent you the original invitation to
              request a new one. Professor invitations include faculty
              assignment information that will be preserved in the new
              invitation.
            </p>
          </div>
        )}

        {type === "declined" && (
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-red-800 text-sm">
              <strong>Changed your mind?</strong> The organization administrator
              has been notified of your decision. You can contact them directly
              to discuss joining the organization with a new invitation.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Link className="w-full" href="/register">
          <Button className="w-full" variant="outline">
            Register as a Professor
          </Button>
        </Link>
        <Link className="w-full" href="/">
          <Button className="w-full" variant="outline">
            Go back to home
          </Button>
        </Link>
        {type === "expired" && (
          <Link className="w-full" href="/contact">
            <Button className="w-full" size="sm" variant="ghost">
              Contact Support
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
