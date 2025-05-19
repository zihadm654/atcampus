import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, LinkIcon, MapPinIcon, NotebookPen } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { UserAvatar } from "../shared/user-avatar";
import { getUserById } from "@/actions/user";

async function Sidebar() {
  const user = await getCurrentUser();
  if (!user) return <UnAuthenticatedSidebar />;
const currentUser = await getUserById(user?.id!);
  if (!currentUser) return null;

  return (
    <div className="sticky top-16 pb-4 space-y-2">
      <Card>
        <CardContent className="pt-2">
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/profile/${user.name}`}
              className="flex flex-col items-center justify-center"
            >
              <UserAvatar
          user={{ name: user.name || null, image: user.image || null }}
          className="size-10 border"
        />

              <div className="mt-4 space-y-1">
                <h3 className="font-semibold">{user.name}</h3>
                {/* <p className="text-sm text-muted-foreground">{user.email}</p> */}
              </div>
            </Link>

            <div className="w-full">
              <Separator className="my-2" />
              <div className="flex justify-between">
                <div>
                  <p>{currentUser._count.followings}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <p>{currentUser?._count.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="flex flex-col items-center text-center space-y-2">
            <Button className="w-full" variant="outline">
              <GraduationCap className="size-6"/> Courses
            </Button>
            <Button className="w-full" variant="outline">
              <NotebookPen className="size-6"/> Suppliments
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
        <p className="text-center text-muted-foreground mb-4">
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
