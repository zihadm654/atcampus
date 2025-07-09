import {
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Search,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ResearchFeed from '@/components/feed/ResearchFeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentUser } from '@/lib/session';
import { constructMetadata } from '@/lib/utils';

export const metadata: Metadata = constructMetadata({
  title: 'Supplement Research - AtCampus',
  description:
    'Find and apply for supplement research to gain practical experience.',
});

export default async function ResearchPage() {
  const user = await getCurrentUser();

  if (!user) redirect('/login');

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header with gradient background */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500/80 to-indigo-600/80 p-6 text-white shadow-md">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <h1 className="font-bold text-3xl">Supplement Research</h1>
          </div>
          <p className="max-w-2xl text-white/90">
            Find and apply for supplement research to gain practical experience
            and enhance your skills while studying
          </p>

          {/* Search bar */}
          <div className="mt-4 flex w-full max-w-md items-center gap-2 rounded-lg bg-white/10 p-1 backdrop-blur-sm">
            <div className="flex h-10 w-full items-center gap-2 rounded-md bg-white px-3 text-gray-800">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                className="h-full w-full border-0 bg-transparent outline-none placeholder:text-gray-400"
                placeholder="Search for research..."
                type="text"
              />
            </div>
            <Button className="h-10 rounded-md hover:bg-blue-800" size="sm">
              Search
            </Button>
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button className="rounded-full" size="sm" variant="outline">
            All Jobs
          </Button>
          <Button className="rounded-full" size="sm" variant="outline">
            On Campus
          </Button>
          <Button className="rounded-full" size="sm" variant="outline">
            Remote
          </Button>
          <Button className="rounded-full" size="sm" variant="outline">
            Part-time
          </Button>
          <Button className="rounded-full" size="sm" variant="outline">
            Full-time
          </Button>
        </div>
        <Button className="rounded-xl" size="sm" variant="outline">
          <Link href="/researches/createResearch">Create Research</Link>
        </Button>
      </div>
      {/* Research listings */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ResearchFeed />
      </div>
    </div>
  );
}
