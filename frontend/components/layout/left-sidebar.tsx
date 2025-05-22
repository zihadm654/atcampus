import Link from "next/link";
import { getUserById } from "@/actions/user";
import { GraduationCap, LinkIcon, MapPinIcon, NotebookPen } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { UserAvatar } from "../shared/user-avatar";

async function Sidebar() {
  const user = await getCurrentUser();
  if (!user) return <UnAuthenticatedSidebar />;
  const currentUser = await getUserById(user?.id!);
  if (!currentUser) return null;

  return (
    <div className="sticky top-16 space-y-2 pb-4">
      <Card>
        <CardContent className="pt-2">
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/profile/${user.username}`}
              className="flex flex-col items-center justify-center"
            >
              <UserAvatar
                user={{
                  name: user.username || user.name,
                  image: user.image || null,
                }}
                className="size-10 border"
              />

              <div className="mt-4 space-y-1">
                <h3 className="font-semibold">{user.username}</h3>
              </div>
            </Link>

            <div className="w-full">
              <Separator className="my-2" />
              <div className="flex justify-between">
                <div>
                  <p>{currentUser._count.followings}</p>
                  <p className="text-muted-foreground text-xs">Following</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <p>{currentUser?._count.followers}</p>
                  <p className="text-muted-foreground text-xs">Followers</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="flex flex-col items-center space-y-2 text-center">
            <Button className="w-full" variant="outline">
              <GraduationCap className="size-6" /> Courses
            </Button>
            <Button className="w-full" variant="outline">
              <NotebookPen className="size-6" /> Suppliments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Sidebar;

const UnAuthenticatedSidebar = () => (
  <div className="sticky top-20">
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">
          Welcome Back!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 text-center">
          Login to access your profile and connect with others.
        </p>
        {/* <SignInButton mode="modal">
          <Button className="w-full" variant="outline">
            Login
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="w-full mt-2" variant="default">
            Sign Up
          </Button>
        </SignUpButton> */}
      </CardContent>
    </Card>
  </div>
);
