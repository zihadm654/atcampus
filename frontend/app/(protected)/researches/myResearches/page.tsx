import { constructMetadata } from "@/lib/utils";

import MyResearches from "./myResearches";

export const metadata = constructMetadata({
  title: "My Researches – AtCampus",
  description: "My research projects and collaborations on AtCampus.",
});

export default function Page() {
  return (
    <div className="w-full min-w-0 space-y-5">
      <MyResearches />
    </div>
  );
}