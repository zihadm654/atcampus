import { constructMetadata } from "@/lib/utils";

import Notifications from "./Notifications";

export const metadata = constructMetadata({
  title: "Notifications - AtCampus",
  description: "Latest news and updates from AtCampus.",
});

export default function Page() {
  return (
    <>
      <div className="w-full min-w-0 space-y-5">
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Notifications</h1>
        </div>
        <Notifications />
      </div>
    </>
  );
}
