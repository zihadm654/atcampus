"use client";

import { acceptFollowRequest, declineFollowRequest } from "@/actions/actions";
import { FollowRequest, User } from "@prisma/client";
import { useOptimistic, useState } from "react";
import { UserAvatar } from "../shared/user-avatar";
import { Button } from "../ui/button";
import { CheckCircle, CheckIcon, Cross, CrossIcon } from "lucide-react";

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
          <span>{request.sender.name}</span>
          <div className="flex gap-3 justify-end">
            <form action={() => accept(request.id, request.sender.id)}>
              <Button type="submit">
                <CheckIcon className="size-4"/>
              </Button>
            </form>
            <form action={() => decline(request.id, request.sender.id)}>
              <Button type="submit">
                <Cross className="size-4"/>
              </Button>
            </form>
          </div>
        </div>
      )})}
    </div>
  );
};

export default FriendRequestList;