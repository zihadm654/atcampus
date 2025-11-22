import { FollowRequest } from "@/hooks/useFollowRequests";

export function filterFollowRequests(requests: FollowRequest[] = [], userId: string) {
  if (!userId) return { received: [], sent: [] };
  
  const received = requests.filter(req => 
    req.targetId === userId && req.status === "PENDING"
  );
  
  const sent = requests.filter(req => 
    req.requesterId === userId && req.status === "PENDING"
  );
  
  return { received, sent };
}

export function getRequestCounts(requests: FollowRequest[] = [], userId: string) {
  const { received, sent } = filterFollowRequests(requests, userId);
  return {
    receivedCount: received.length,
    sentCount: sent.length,
    totalCount: requests.length,
  };
}