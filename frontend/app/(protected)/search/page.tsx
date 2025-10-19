import type { Metadata } from "next";

import SearchResults from "./SearchResults";

interface PageProps {
  searchParams: Promise<{ q: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: `Search results for "${q}"`,
  };
}

export default async function Page({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <h1 className="line-clamp-2 break-all text-center font-bold text-xl">
          Search results for &quot;{q}&quot;
        </h1>
      </div>
      <SearchResults query={q} />
    </div>
  );
}
