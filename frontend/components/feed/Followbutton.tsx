"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { switchFollow } from "@/actions/actions";

function FollowButton({ userId,existingReq }: { userId: string,existingReq:any}) {
  const [isLoading, setIsLoading] = useState(false);
  const handleFollow = async () => {
    setIsLoading(true);

    try {
      const data = await switchFollow(userId);
      toast.success(data.message);
    } catch (error) {
      toast.error("Error following user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size={"sm"} variant={"secondary"} onClick={handleFollow} disabled={isLoading} className="w-20">
      {isLoading ? <Loader2Icon className="size-4 animate-spin" />:existingReq ?"followed" : "Follow"}
    </Button>
  );
}
export default FollowButton;
