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

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-2">
      <Card className="max-w-[420px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription>
            Your account is currently under review by an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-muted-foreground text-sm">
            You will receive an email notification once your account status
            changes. Thank you for your patience.
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2">
          <ReturnButton href="/login" label="Go to Login" />
          <SignOutButton />
        </CardFooter>
      </Card>
    </div>
  );
}
