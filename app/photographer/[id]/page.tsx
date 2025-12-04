import { Header } from "@/app/components/Header";
import {
  fetchPhotographerProfile,
  type PhotographerEvent,
  type EventGroup,
} from "@/app/api/actions/creator";
import { MapPin, Camera, Calendar, Award, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ eventId?: string }>;
}

export default async function PhotographerProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { eventId } = await searchParams;

  const data = await fetchPhotographerProfile(id, eventId);

  if (!data) {
    notFound();
  }

  const { photographer, events, totalImages, eventGroups } = data;

  return (
    <>
      <Header variant="solid" textVariant="dark" />

      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Cover Photo */}
        <div className="relative h-64 bg-gradient-to-r from-cyan-500 to-blue-600">
          <Image
            src="/thumbnail.png"
            alt="Cover"
            fill
            className="object-cover opacity-30"
          />
        </div>

        {/* Profile Header */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 -mt-20 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden">
                  {photographer.avatar ? (
                    <Image
                      src={photographer.avatar}
                      alt={photographer.name || "Photographer"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cyan-100 text-cyan-600 text-4xl font-bold">
                      {photographer.name?.charAt(0) || "P"}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-cyan-400 rounded-full p-2 border-2 border-white">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {photographer.name || "Unknown"}
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                      @
                      {photographer.displayName ||
                        photographer.email.split("@")[0]}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {photographer.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{photographer.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Member since{" "}
                          {new Date(photographer.memberSince).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex gap-2">
                    <span className="px-4 py-2 bg-cyan-400 text-black rounded-lg font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {photographer.email}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {photographer.eventsCount}
                    </div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">
                      {photographer.imagesCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Photos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {photographer.bio && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600">{photographer.bio}</p>
              </div>
            )}

            {/* Photography Type */}
            {photographer.photographyType && (
              <div className="mt-4">
                <span className="inline-block px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium">
                  {photographer.photographyType}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Event Filter */}
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <Link
                href={`/photographer/${id}`}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  !eventId
                    ? "bg-cyan-400 text-black"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Photos ({totalImages})
              </Link>
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/photographer/${id}?eventId=${event.id}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    eventId === event.id
                      ? "bg-cyan-400 text-black"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {event.name} ({event.photoCount})
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery - iPhone style grouped by event */}
        <div className="max-w-7xl mx-auto px-4 mt-6 pb-20">
          {eventGroups.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No photos yet
              </h3>
              <p className="text-gray-600">
                This photographer hasn&apos;t uploaded any photos yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {eventGroups.map((group, index) => (
                <EventGroupSection
                  key={group.event?.id || index}
                  group={group}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function EventGroupSection({ group }: { group: EventGroup }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Event Header */}
      <div className="p-4 border-b border-gray-200">
        {group.event ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {group.event.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(group.event.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{group.event.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                <span>{group.images.length} photos</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Uncategorized
            </h3>
            <p className="text-sm text-gray-600">
              {group.images.length} photos
            </p>
          </div>
        )}
      </div>

      {/* Photo Grid - iPhone Gallery Style */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0.5 p-0.5">
        {group.images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square bg-gray-100 group cursor-pointer"
          >
            <Image
              src={image.url}
              alt={image.description || "Photo"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
