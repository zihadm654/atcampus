import { constructMetadata } from "@/lib/utils";
import TrendsSidebar from "@/components/feed/TrendsSidebar";

import Bookmarks from "./Bookmarks";

export const metadata = constructMetadata({
  title: "Bookmarks – AtCampus",
  description: "Latest news and updates from Next AtCampus.",
});

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Bookmarks</h1>
        </div>
        <Bookmarks />
      </div>
      <TrendsSidebar />
    </main>
  );
}
