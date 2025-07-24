import { constructMetadata } from '@/lib/utils';

import Bookmarks from './Bookmarks';

export const metadata = constructMetadata({
  title: 'Bookmarks – AtCampus',
  description: 'Latest news and updates from Next AtCampus.',
});

export default function Page() {
  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <h1 className="text-center font-bold text-2xl">Bookmarks</h1>
      </div>
      <Bookmarks />
    </div>
  );
}
