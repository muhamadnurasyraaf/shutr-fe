"use client";

import { useState, useEffect } from "react";
import { Header } from "@/app/components/Header";
import { useClientAPI } from "@/lib/client-api";
import {
  Database,
  Search,
  RefreshCw,
  Trash2,
  FileText,
  Users,
  Image,
  Calendar,
  AlertCircle,
  CheckCircle,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CollectionStats {
  numberOfDocuments: number;
}

interface IndexStats {
  events: CollectionStats;
  creators: CollectionStats;
  images: CollectionStats;
}

interface SearchResult {
  hits: any[];
  estimatedTotalHits: number;
}

export default function TypesenseAdminPage() {
  const api = useClientAPI();
  const [stats, setStats] = useState<IndexStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<
    "events" | "creators" | "images"
  >("events");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastQuery, setLastQuery] = useState<string>("*");
  const pageSize = 20;

  useEffect(() => {
    loadStats();
  }, []);

  // Load documents when index changes
  useEffect(() => {
    loadDocuments();
  }, [selectedIndex]);

  async function loadStats() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/search/stats");
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  async function loadDocuments(page: number = 1) {
    try {
      setSearching(true);
      setSearchQuery("");
      setLastQuery("*");
      setCurrentPage(page);
      const offset = (page - 1) * pageSize;
      const response = await api.get(
        `/search/${selectedIndex}?q=*&limit=${pageSize}&offset=${offset}`,
      );
      setSearchResults(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setSearching(false);
    }
  }

  async function handleSearch(page: number = 1) {
    try {
      setSearching(true);
      const query = searchQuery.trim() || "*";
      setLastQuery(query);
      setCurrentPage(page);
      const offset = (page - 1) * pageSize;
      const response = await api.get(
        `/search/${selectedIndex}?q=${encodeURIComponent(query)}&limit=${pageSize}&offset=${offset}`,
      );
      setSearchResults(response.data);
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  }

  function handlePageChange(newPage: number) {
    if (lastQuery === "*" && !searchQuery) {
      loadDocuments(newPage);
    } else {
      handleSearch(newPage);
    }
  }

  const getIndexIcon = (index: string) => {
    switch (index) {
      case "events":
        return <Calendar className="w-6 h-6" />;
      case "creators":
        return <Users className="w-6 h-6" />;
      case "images":
        return <Image className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getIndexColor = (index: string) => {
    switch (index) {
      case "events":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "creators":
        return "bg-purple-100 text-purple-600 border-purple-200";
      case "images":
        return "bg-green-100 text-green-600 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <>
      <Header variant="solid" textVariant="dark" />

      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Header */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Database className="w-10 h-10 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-bold">Typesense Dashboard</h1>
                <p className="text-gray-400">Monitor and search your indexes</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Index Statistics
              </h2>
              <button
                onClick={loadStats}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {loading && !stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(stats).map(([index, data]) => (
                  <div
                    key={index}
                    className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedIndex === index
                        ? "border-cyan-400 shadow-md"
                        : "border-gray-200"
                    }`}
                    onClick={() => setSelectedIndex(index as any)}
                  >
                    <div
                      className={`inline-flex p-3 rounded-lg mb-4 ${getIndexColor(index)}`}
                    >
                      {getIndexIcon(index)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize mb-1">
                      {index}
                    </h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {data.numberOfDocuments.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">documents</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Search Index
            </h2>

            <div className="flex gap-4 mb-4">
              {/* Index Selector */}
              <div className="flex gap-2">
                {["events", "creators", "images"].map((index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedIndex(index as any);
                      setSearchResults(null);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                      selectedIndex === index
                        ? "bg-cyan-400 text-black"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {index}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${selectedIndex}... (typo tolerance enabled)`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={searching}
                className="px-6 py-3 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-500 transition-colors disabled:opacity-50"
              >
                {searching ? "Searching..." : "Search"}
              </button>
              <button
                onClick={() => loadDocuments()}
                disabled={searching}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                Show All
              </button>
            </div>

            {/* Search Results */}
            {searchResults && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">
                    {searchQuery ? (
                      <>
                        Found{" "}
                        <strong>{searchResults.estimatedTotalHits}</strong>{" "}
                        results for "<strong>{searchQuery}</strong>" in{" "}
                        <strong>{selectedIndex}</strong>
                      </>
                    ) : (
                      <>
                        Showing <strong>{searchResults.hits.length}</strong> of{" "}
                        <strong>{searchResults.estimatedTotalHits}</strong>{" "}
                        documents in <strong>{selectedIndex}</strong>
                      </>
                    )}
                  </span>
                </div>

                {searchResults.hits.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            {selectedIndex === "events"
                              ? "Name"
                              : selectedIndex === "creators"
                                ? "Name / Email"
                                : "Description / Bib"}
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            {selectedIndex === "events"
                              ? "Location"
                              : selectedIndex === "creators"
                                ? "Type"
                                : "Event"}
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {searchResults.hits.map((hit: any, index: number) => (
                          <tr
                            key={hit.id || index}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                              {hit.id?.substring(0, 8)}...
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {selectedIndex === "events" && hit.name}
                              {selectedIndex === "creators" &&
                                (hit.displayName || hit.name || hit.email)}
                              {selectedIndex === "images" &&
                                (hit.description ||
                                  hit.bibNumber ||
                                  "No description")}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {selectedIndex === "events" && hit.location}
                              {selectedIndex === "creators" &&
                                (hit.photographyType || "N/A")}
                              {selectedIndex === "images" &&
                                (hit.eventName || "No event")}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {selectedIndex === "events" &&
                                `${hit.imageCount || 0} images`}
                              {selectedIndex === "creators" &&
                                `${hit.eventsCount || 0} events, ${hit.imagesCount || 0} images`}
                              {selectedIndex === "images" &&
                                (hit.plateNumber
                                  ? `Plate: ${hit.plateNumber}`
                                  : hit.bibNumber
                                    ? `Bib: ${hit.bibNumber}`
                                    : "N/A")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No results found
                  </div>
                )}

                {/* Pagination Controls */}
                {searchResults.estimatedTotalHits > pageSize && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of{" "}
                      {Math.ceil(searchResults.estimatedTotalHits / pageSize)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || searching}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const totalPages = Math.ceil(
                            searchResults.estimatedTotalHits / pageSize,
                          );
                          const pages: (number | string)[] = [];
                          if (totalPages <= 7) {
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                          } else {
                            if (currentPage <= 3) {
                              pages.push(1, 2, 3, 4, "...", totalPages);
                            } else if (currentPage >= totalPages - 2) {
                              pages.push(
                                1,
                                "...",
                                totalPages - 3,
                                totalPages - 2,
                                totalPages - 1,
                                totalPages,
                              );
                            } else {
                              pages.push(
                                1,
                                "...",
                                currentPage - 1,
                                currentPage,
                                currentPage + 1,
                                "...",
                                totalPages,
                              );
                            }
                          }
                          return pages.map((page, idx) =>
                            page === "..." ? (
                              <span
                                key={`ellipsis-${idx}`}
                                className="px-2 text-gray-400"
                              >
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page as number)}
                                disabled={searching}
                                className={`px-3 py-1 rounded-lg transition-colors ${
                                  currentPage === page
                                    ? "bg-cyan-400 text-black font-semibold"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {page}
                              </button>
                            ),
                          );
                        })()}
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage >=
                            Math.ceil(
                              searchResults.estimatedTotalHits / pageSize,
                            ) || searching
                        }
                        className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Typesense Features
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Typo Tolerance:</strong> Search "ergn" to find "ergo",
                "maraton" to find "marathon"
              </li>
              <li>
                • <strong>Fast Search:</strong> Results in milliseconds
              </li>
              <li>
                • <strong>Faceted Search:</strong> Filter by photographyType,
                location, eventId
              </li>
              <li>
                • <strong>Real-time:</strong> New data is indexed immediately
                when created
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
