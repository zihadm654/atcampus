import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./../ui/button";

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  loading?: boolean;
}) {
  return (
    <Button
      className={cn("flex items-center gap-2", className)}
      disabled={loading || disabled}
      variant="outline"
      {...props}
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {props.children}
    </Button>
  );
}
