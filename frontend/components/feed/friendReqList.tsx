"use client";

import { acceptFollowRequest, declineFollowRequest } from "@/actions/actions";
import { FollowRequest, User } from "@prisma/client";
import Image from "next/image";
import { useOptimistic, useState } from "react";
import { UserAvatar } from "../shared/user-avatar";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Icons } from "../shared/icons";
import { getUserById } from "@/actions/user";

type RequestWithUser = FollowRequest & {
  sender: User;
};

const FriendRequestList = ({ requests }: { requests: RequestWithUser[] }) => {
  const [requestState, setRequestState] = useState(requests);

  const accept = async (requestId: string, userId: string) => {
    removeOptimisticRequest(requestId);
    try {
      await acceptFollowRequest(userId);
      setRequestState((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {}
  };
  const decline = async (requestId: string, userId: string) => {
    removeOptimisticRequest(requestId);
    try {
      await declineFollowRequest(userId);
      setRequestState((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {}
  };

  const [optimisticRequests, removeOptimisticRequest] = useOptimistic(
    requestState,
    (state, value: string) => state.filter((req) => req.id !== value)
  );
  return (
    <div className="">
      {optimisticRequests.map(async (request) => {
        return(
        <div className="flex items-center justify-between" key={request.id}>
          <UserAvatar user={request.sender} />
          <div className="flex gap-3 justify-end">
            <form action={() => accept(request.id, request.sender.id)}>
              <Button type="submit">
                ok
              </Button>
            </form>
            <form action={() => decline(request.id, request.sender.id)}>
              <Button type="submit">
                no
              </Button>
            </form>
          </div>
        </div>
      )})}
    </div>
  );
};

export default FriendRequestList;