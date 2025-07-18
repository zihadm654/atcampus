import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Search,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResearchFeed from "@/components/feed/ResearchFeed";

export const metadata: Metadata = constructMetadata({
  title: "Supplement Research - AtCampus",
  description:
    "Find and apply for supplement research to gain practical experience.",
});

export default async function ResearchPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Research listings */}
      <ResearchFeed />
    </div>
  );
}
