// import { getUserById } from "@/actions/user";
import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const ProfileCard = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) return null;

  // const user = await getUserById(currentUser.id);

  // if (!user) return null;

  return (
    <div className="flex flex-col gap-6 rounded-lg p-4 text-sm shadow-md">
      <div className="relative h-20">
        {/* <Image
          src={user.coverImage || "/noCover.png"}
          alt=""
          fill
          className="rounded-md object-cover"
        />
        <Image
          src={user.image || "/noAvatar.png"}
          alt=""
          width={48}
          height={48}
          className="rounded-full object-cover w-12 h-12 absolute left-0 right-0 m-auto -bottom-6 ring-1 z-10"
        /> */}
      </div>
      <div className="flex h-20 flex-col items-center gap-2">
        <span className="font-semibold">{/* {user.name} */}</span>
        <div className="flex items-center gap-4">
          <div className="flex">
            <Image
              src="https://images.pexels.com/photos/19578755/pexels-photo-19578755/free-photo-of-woman-watching-birds-and-landscape.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
              alt=""
              width={12}
              height={12}
              className="h-3 w-3 rounded-full object-cover"
            />
            <Image
              src="https://images.pexels.com/photos/19578755/pexels-photo-19578755/free-photo-of-woman-watching-birds-and-landscape.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
              alt=""
              width={12}
              height={12}
              className="h-3 w-3 rounded-full object-cover"
            />
            <Image
              src="https://images.pexels.com/photos/19578755/pexels-photo-19578755/free-photo-of-woman-watching-birds-and-landscape.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
              alt=""
              width={12}
              height={12}
              className="h-3 w-3 rounded-full object-cover"
            />
          </div>
          <span className="text-xs text-gray-500">
            {/* {user._count.followers} Followers */}
          </span>
        </div>
        {/* <Link href={`/profile/${user.name}`}>
          <button className="bg-blue-500 text-white text-xs p-2 rounded-md">
            My Profile
          </button>
        </Link> */}
      </div>
    </div>
  );
};

export default ProfileCard;
