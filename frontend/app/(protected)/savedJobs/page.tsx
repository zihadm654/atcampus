import { constructMetadata } from "@/lib/utils";

import SaveJobs from "./SaveJobs";

export const metadata = constructMetadata({
  title: "Bookmarks – AtCampus",
  description: "Latest news and updates from Next AtCampus.",
});

export default function Page() {
  return (
    <div className="w-full min-w-0 space-y-5">
      <h1 className=" font-bold text-2xl">Saved Jobs</h1>
      <SaveJobs />
    </div>
  );
}
