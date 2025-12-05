import { MapPin, Camera, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Photographer } from "../api/actions/creator";

interface PhotographerGridProps {
  photographers: Photographer[];
  total: number;
  hasMore: boolean;
  searchQuery?: string;
}

export function PhotographerGrid({
  photographers,
  total,
  hasMore,
  searchQuery,
}: PhotographerGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600">
          {searchQuery ? (
            <>
              Found <span className="font-semibold">{total}</span> photographers
              matching "<span className="font-semibold">{searchQuery}</span>"
            </>
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold">{photographers.length}</span> of{" "}
              <span className="font-semibold">{total}</span> photographers
            </>
          )}
        </p>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
          <option>Sort by: Top Rated</option>
          <option>Sort by: Most Events</option>
          <option>Sort by: Recent</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photographers.map((photographer) => (
          <div
            key={photographer.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
          >
            {/* Cover Photo */}
            <div className="relative h-32 bg-gradient-to-r from-cyan-400 to-blue-500">
              <Image
                src="/thumbnail.png"
                alt="Cover"
                fill
                className="object-cover opacity-50"
              />
            </div>

            {/* Avatar */}
            <div className="relative px-6 pb-6">
              <div className="absolute -top-12 left-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                    {photographer.avatar ? (
                      <Image
                        src={photographer.avatar}
                        alt={photographer.name || "Photographer"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-cyan-100 text-cyan-600 text-2xl font-bold">
                        {photographer.name?.charAt(0) || "P"}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-cyan-400 rounded-full p-1">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <div className="pt-14">
                <h3 className="text-xl font-bold text-gray-900">
                  {photographer.name || "Unknown"}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  @
                  {photographer.displayName || photographer.email.split("@")[0]}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    <span>{photographer.eventsCount} events</span>
                  </div>
                  {photographer.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{photographer.location}</span>
                    </div>
                  )}
                </div>

                {/* Specialty */}
                {photographer.photographyType && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-medium">
                      {photographer.photographyType}
                    </span>
                  </div>
                )}

                {/* Description */}
                {photographer.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {photographer.bio}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/photographer/${photographer.id}`}
                    className="flex-1 bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-cyan-500 transition-colors text-center"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More - only show if there are more photographers */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button className="px-8 py-3 border border-cyan-400 text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
            Load More Photographers
          </button>
        </div>
      )}
    </section>
  );
}
