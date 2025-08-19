import { ReturnButton } from "@/components/auth/return-button";
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
          <p className="text-sm text-muted-foreground">
            You will receive an email notification once your account status
            changes. Thank you for your patience.
          </p>
        </CardContent>
        <CardFooter>
          <ReturnButton href="/login" label="Go to Login" />
        </CardFooter>
      </Card>
    </div>
  );
}
