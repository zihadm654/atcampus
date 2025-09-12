import { ReturnButton } from "@/components/auth/return-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RejectedAccountPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-2">
      <Card className="max-w-[420px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Account Rejected</CardTitle>
          <CardDescription>
            Unfortunately, your account registration has been rejected.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact support for further
            assistance.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-2">
          <ReturnButton href="/login" label="Go to Login" />
          <SignOutButton />
        </CardFooter>
      </Card>
    </div>
  );
}
