"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Camera } from "lucide-react";
import { Header } from "../components/Header";
import { useClientAPI } from "@/lib/client-api";
import { getCloudinaryUrl } from "@/lib/cloudinary";

interface Photographer {
  id: string;
  email: string;
  name: string;
  displayName?: string | null;
  creatorInfo?: {
    location: string | null;
  };
}

interface Event {
  id: string;
  name: string;
  date: string;
  thumbnailUrl?: string | null;
  location: string;
}

interface SearchResults {
  events: Event[];
  photographers: Photographer[];
}

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const api = useClientAPI();

  const queryParam = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [results, setResults] = useState<SearchResults>({
    events: [],
    photographers: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchQuery(queryParam);
    if (queryParam) {
      fetchSearchResults(queryParam);
    }
  }, [queryParam]);

  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.get<SearchResults>(
        `/search?q=${encodeURIComponent(query)}`,
      );
      setResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="solid" textVariant="dark" />

      {/* Top Filter Section */}
      <section className="bg-gray-50 border-b border-gray-200 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {queryParam && (
            <p className="text-sm text-gray-600 mb-4">
              Showing results for "
              <span className="text-cyan-500">{queryParam}</span>"
            </p>
          )}

          <div className="flex gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-300"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Filter events
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-300"
            >
              <Calendar className="h-4 w-4 mr-1" />
              By date
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-300"
            >
              <Camera className="h-4 w-4 mr-1" />
              By location
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Input
              type="text"
              placeholder="Enter Event Name / Photographer Profile"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-12 bg-white border-gray-300"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-cyan-400 text-white rounded hover:bg-cyan-500 transition-colors"
            >
              {isLoading ? "..." : "🔍"}
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : (
          <>
            {/* Photographers Section */}
            {results.photographers.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Photographers
                </h2>

                <div className="grid grid-cols-3 gap-6">
                  {results.photographers.map((photographer) => (
                    <div
                      key={photographer.id}
                      className="flex flex-col items-center cursor-pointer"
                      onClick={() => router.push(`/creator/${photographer.id}`)}
                    >
                      <Avatar className="h-24 w-24 mb-3">
                        <AvatarFallback className="bg-gray-200 text-gray-600">
                          {(photographer.displayName || photographer.name)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-sm font-medium text-gray-900">
                        {photographer.displayName || photographer.name}
                      </h3>
                      {photographer.creatorInfo?.location && (
                        <p className="text-xs text-gray-500">
                          {photographer.creatorInfo.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Events Section */}
            {results.events.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Events
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {results.events.map((event) => (
                    <Card
                      key={event.id}
                      className="overflow-hidden border border-gray-300 cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => router.push(`/events/${event.id}/images`)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {event.thumbnailUrl ? (
                          <img
                            src={getCloudinaryUrl(
                              event.thumbnailUrl,
                              "standard",
                            )}
                            alt={event.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100">
                            <Camera className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                          {event.name}
                        </h3>
                        <Button
                          size="sm"
                          className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/events/${event.id}/images`);
                          }}
                        >
                          View Photos
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {queryParam &&
              results.events.length === 0 &&
              results.photographers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No results found for "{queryParam}"
                  </p>
                </div>
              )}

            {/* Initial State */}
            {!queryParam && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Enter a search term to find events and photographers
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold mb-4">
              <span className="text-cyan-400">S</span>
              <span className="text-gray-900">hutr</span>
            </div>
            <p className="text-sm text-gray-500">
              Find your best moment in every event photo.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/events" className="hover:text-cyan-500">
                  Search Events
                </a>
              </li>
              <li>
                <a href="/photographers" className="hover:text-cyan-500">
                  Find Photographers
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-cyan-500">
                  Top Photographers
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/help" className="hover:text-cyan-500">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-cyan-500">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-cyan-500">
                  FAQ
                </a>
              </li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-3 mt-6">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/privacy" className="hover:text-cyan-500">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-cyan-500">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/cookies" className="hover:text-cyan-500">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2025 Shutr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
