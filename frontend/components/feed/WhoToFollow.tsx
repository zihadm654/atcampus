import { getRandomUsers } from "@/actions/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import FollowButton from "./Followbutton";
import { existingFollowRequest } from "@/actions/actions";
import { UserAvatar } from "../shared/user-avatar";

async function WhoToFollow() {
  const users = await getRandomUsers();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Who to Follow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user:any) => {
            const existingReq = existingFollowRequest(user.id);
            return(
            <div key={user.id} className="flex gap-2 items-center justify-between ">
              <div className="flex items-center gap-1">
                <Link href={`/profile/${user.name}`}>
                  <UserAvatar user={user}/>
                </Link>
                <div className="text-xs">
                  <Link href={`/profile/${user.name}`} className="font-medium cursor-pointer">
                    {user.name}
                  </Link>
                  <p className="text-muted-foreground">@{user.name}</p>
                  <p className="text-muted-foreground">{user._count.followers} followers</p>
                </div>
              </div>
              <FollowButton userId={user.id} existingReq={existingReq} />
            </div>
          )})}
        </div>
      </CardContent>
    </Card>
  );
}
export default WhoToFollow;
