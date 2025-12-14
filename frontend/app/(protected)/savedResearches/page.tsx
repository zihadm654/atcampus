import { constructMetadata } from "@/lib/utils";

import Bookmarks from "./Bookmarks";

export const metadata = constructMetadata({
	title: "Saved Researches – AtCampus",
	description: "Saved researches and updates from Next AtCampus.",
});

export default function Page() {
	return (
		<div className="w-full min-w-0 space-y-5">
			<h1 className="font-bold text-2xl">Saved Researches</h1>
			<Bookmarks />
		</div>
	);
}
