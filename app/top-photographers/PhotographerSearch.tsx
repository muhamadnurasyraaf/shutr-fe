"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface PhotographerSearchProps {
  initialQuery: string;
}

export function PhotographerSearch({ initialQuery }: PhotographerSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }

    router.push(`?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search photographers by name, location, or specialty..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-24 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-300 focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
