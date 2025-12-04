"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { PhotographyType } from "../api/actions/creator";

const categories: { label: string; value: PhotographyType | null }[] = [
  { label: "All", value: null },
  { label: "Marathon", value: "Marathon" },
  { label: "Wildlife", value: "Wildlife" },
  { label: "Motorsports", value: "Motorsports" },
];

interface CategoryFilterProps {
  selected: PhotographyType | null;
}

export function CategoryFilter({ selected }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (category: PhotographyType | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === null) {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() => handleFilter(category.value)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selected === category.value
                  ? "bg-cyan-400 text-black"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
