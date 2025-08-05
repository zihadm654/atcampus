import { AlertCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface InvitationErrorProps {
  error?: string;
  type?: 'invalid' | 'expired' | 'declined' | 'general';
}

export function InvitationError({ error, type = 'general' }: InvitationErrorProps) {
  const getErrorContent = () => {
    switch (type) {
      case 'expired':
        return {
          icon: <Clock className="h-6 w-6 text-orange-600" />,
          title: 'Professor Invitation Expired',
          description: 'This professor invitation has expired.',
          message: 'The professor invitation you\'re trying to access has expired. Professor invitations are valid for 30 days from the time they were sent. Please contact the organization administrator to request a new invitation.',
          titleColor: 'text-orange-600',
        };
      case 'declined':
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          title: 'Professor Invitation Declined',
          description: 'This professor invitation has been declined.',
          message: 'This professor invitation has already been declined. The organization administrator has been notified. If you changed your mind, please contact them directly to request a new invitation.',
          titleColor: 'text-red-600',
        };
      case 'invalid':
        return {
          icon: <AlertCircle className="h-6 w-6 text-destructive" />,
          title: 'Invalid Professor Invitation',
          description: 'This professor invitation link is not valid.',
          message: 'The professor invitation link you\'re trying to access is invalid, has been cancelled, or may have already been used. Please check your email for a valid invitation link or contact the organization administrator.',
          titleColor: 'text-destructive',
        };
      default:
        return {
          icon: <AlertCircle className="h-6 w-6 text-destructive" />,
          title: 'Invitation Error',
          description: 'There was an issue with your invitation.',
          message: error || 'The invitation you\'re trying to access is either invalid or you don\'t have the correct permissions. Please check your email for a valid invitation or contact the person who sent it.',
          titleColor: 'text-destructive',
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
        <CardDescription>
          {errorContent.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground text-sm">
          {errorContent.message}
        </p>
        
        {type === 'expired' && (
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Need a new professor invitation?</strong> Contact the organization administrator 
              who sent you the original invitation to request a new one. Professor invitations include 
              faculty assignment information that will be preserved in the new invitation.
            </p>
          </div>
        )}
        
        {type === 'declined' && (
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Changed your mind?</strong> The organization administrator has been notified 
              of your decision. You can contact them directly to discuss joining the organization 
              with a new invitation.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Link className="w-full" href="/">
          <Button className="w-full" variant="outline">
            Go back to home
          </Button>
        </Link>
        {type === 'expired' && (
          <Link className="w-full" href="/contact">
            <Button className="w-full" variant="ghost" size="sm">
              Contact Support
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
