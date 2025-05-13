import Image from "next/image";
import Link from "next/link";
import FriendRequestList from "./friendReqList";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader } from "../ui/card";

const FriendRequests = async () => {
const user = await getCurrentUser();
  const userId = user?.id;
  if (!userId) return null;

  const requests = await prisma.followRequest.findMany({
    where: {
      receiverId: userId,
    },
    include: {
      sender: true,
    },
  });

  if (requests.length === 0) return null;
  return (
    <>
    <Card className="w-full my-2">
      <CardHeader className="flex items-center space-between">
      <span className="text-gray-500">Friend Requests</span>
      <Link href="/" className="text-blue-500 text-xs">
      See all
      </Link>
      </CardHeader>
      <CardContent>
      <FriendRequestList requests={requests}/>  
      </CardContent>
    </Card>
      {/* USER */}
    </>
  );
};

export default FriendRequests;