"use client";

import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Search, MapPin, Calendar, Camera, Filter, X } from "lucide-react";
import Image from "next/image";
import { useClientAPI } from "@/lib/client-api";

interface GetEventsParams {
  page: number;
  limit: number;
  eventId?: string | null;
  sortBy: "event" | "date" | "name";
  sortDirection: "asc" | "desc";
}

interface EventData {
  id: string;
  name: string;
  description: string | null;
  date: string;
  thumbnailUrl: string | null;
  location: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  _count: {
    images: number;
  };
}

interface EventsResponse {
  data: EventData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SearchEventsPage() {
  const api = useClientAPI();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    loadEvents();
  }, [pagination.page]);

  async function loadEvents() {
    try {
      setLoading(true);
      const response = await api.get(
        `/event?page=${pagination.page}&limit=${pagination.limit}&sortBy=date&sortDirection=desc`
      );

      console.log("Events response:", response.data);
      setEvents(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation =
      !selectedLocation ||
      event.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesDate =
      !selectedDate ||
      new Date(event.date).toISOString().split("T")[0] === selectedDate;

    return matchesSearch && matchesLocation && matchesDate;
  });

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedLocation("");
    setSearchQuery("");
  };

  const loadMoreEvents = () => {
    if (pagination.hasNext) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  return (
    <>
      <Header variant="solid" textVariant="dark" />

      <div className="min-h-screen bg-gray-50 pt-20">
        <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Search Events
              </h1>
              <p className="text-lg md:text-xl text-cyan-100 max-w-2xl mx-auto">
                Find your photos from thousands of events captured by
                professional photographers
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by event name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter city or state"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-6">
            <p className="text-gray-600">
              Found{" "}
              <span className="font-semibold">{filteredEvents.length}</span>{" "}
              events
              {searchQuery && <span> matching "{searchQuery}"</span>}
            </p>
          </div>

          {loading && (
            <div className="text-center py-20">
              <p className="text-gray-600">Loading events...</p>
            </div>
          )}

          {!loading && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-cyan-400 text-black rounded-lg font-semibold hover:bg-cyan-500 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {!loading && filteredEvents.length > 0 && pagination.hasNext && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={loadMoreEvents}
                className="px-8 py-3 border border-cyan-400 text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition-colors"
              >
                Load More Events
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function EventCard({ event }: { event: EventData }) {
  const eventDate = new Date(event.date);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer">
      <div className="relative h-48 bg-gray-100">
        {event.thumbnailUrl ? (
          <Image
            src={event.thumbnailUrl}
            alt={event.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100">
            <Camera className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {event.name}
        </h3>

        {event.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {eventDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1.5 text-sm font-medium text-cyan-600">
            <Camera className="h-4 w-4" />
            <span>{event._count.images} photos</span>
          </div>
          <button className="px-4 py-2 bg-cyan-400 text-black text-sm font-semibold rounded-lg hover:bg-cyan-500 transition-colors">
            View Photos
          </button>
        </div>
      </div>
    </div>
  );
}
