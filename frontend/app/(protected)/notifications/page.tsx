import { constructMetadata } from "@/lib/utils";

import Notifications from "./Notifications";

export const metadata = constructMetadata({
  title: "Notifications - AtCampus",
  description: "Latest news and updates from AtCampus.",
});

export default function Page() {
  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <h1 className="text-center font-bold text-2xl">Notifications</h1>
      </div>
      <Notifications />
    </div>
  );
}
