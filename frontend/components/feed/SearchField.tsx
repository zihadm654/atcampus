"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";

export default function SearchField() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form action="/search" method="GET" onSubmit={handleSubmit}>
      <div className="relative max-md:w-full">
        <Input className="pe-10" name="q" placeholder="Search" />
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 right-3 size-5 transform text-muted-foreground" />
      </div>
    </form>
  );
}
