"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  Trash2,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { Header } from "@/app/components/Header";
import { useRouter } from "next/navigation";
import {
  fetchCreatorContents,
  type EventGroup,
  type ContentImage,
} from "@/app/api/actions/creator";
import { getEventsList, type EventListItem } from "@/app/api/actions/event";
import { ImageDetailModal } from "./ImageDetailModal";

type FilterType = "all" | "recent";
type SortType = "newest" | "oldest" | "a-z";

export default function CreatorContentsPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("newest");
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Data states
  const [eventGroups, setEventGroups] = useState<EventGroup[]>([]);
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalImages, setTotalImages] = useState(0);

  // Modal state
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle success message from upload page
  useEffect(() => {
    const message = sessionStorage.getItem("uploadSuccessMessage");
    if (message) {
      setSuccessMessage(message);
      sessionStorage.removeItem("uploadSuccessMessage");
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle event filter from URL query parameter
  useEffect(() => {
    const eventId = searchParams.get("event");
    if (eventId) {
      setSelectedEventFilter(eventId);
      // Expand the event by default
      setExpandedEvents(new Set([eventId]));
    }
  }, [searchParams]);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      if (status !== "authenticated" || !session?.user?.id) return;

      setIsLoading(true);
      try {
        const [contentsData, eventsData] = await Promise.all([
          fetchCreatorContents(session.user.id),
          getEventsList(),
        ]);
        setEventGroups(contentsData.eventGroups);
        setTotalImages(contentsData.totalImages);
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [status, session?.user?.id]);

  // Filter and sort the event groups
  const filteredGroups = useMemo(() => {
    let groups = [...eventGroups];

    // Filter by selected event
    if (selectedEventFilter !== "all") {
      groups = groups.filter(
        (group) =>
          group.event?.id === selectedEventFilter ||
          (selectedEventFilter === "uncategorized" && !group.event),
      );
    }

    // Apply search filter (search by event name)
    if (searchQuery.trim()) {
      groups = groups.filter((group) =>
        group.event?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter images within groups based on filter type
    if (filterType === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      groups = groups
        .map((group) => ({
          ...group,
          images: group.images.filter(
            (img) => new Date(img.createdAt) > sevenDaysAgo,
          ),
        }))
        .filter((group) => group.images.length > 0);
    }

    // Sort groups
    if (sortType === "newest") {
      groups.sort((a, b) => {
        if (!a.event) return 1;
        if (!b.event) return -1;
        return (
          new Date(b.event.date).getTime() - new Date(a.event.date).getTime()
        );
      });
    } else if (sortType === "oldest") {
      groups.sort((a, b) => {
        if (!a.event) return 1;
        if (!b.event) return -1;
        return (
          new Date(a.event.date).getTime() - new Date(b.event.date).getTime()
        );
      });
    } else if (sortType === "a-z") {
      groups.sort((a, b) => {
        const nameA = a.event?.name || "Uncategorized";
        const nameB = b.event?.name || "Uncategorized";
        return nameA.localeCompare(nameB);
      });
    }

    return groups;
  }, [eventGroups, searchQuery, filterType, sortType, selectedEventFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const togglePhotoSelection = (id: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPhotos(newSelected);
  };

  const allPhotos = filteredGroups.flatMap((group) => group.images);

  const toggleSelectAll = () => {
    if (selectedPhotos.size === allPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(allPhotos.map((p) => p.id)));
    }
  };

  const toggleEventExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const handleBulkDelete = () => {
    console.log("Deleting photos:", Array.from(selectedPhotos));
    setSelectedPhotos(new Set());
  };

  const handleBulkDownload = () => {
    console.log("Downloading photos:", Array.from(selectedPhotos));
  };

  const handleBulkMove = () => {
    console.log("Moving photos:", Array.from(selectedPhotos));
  };

  const handleImageClick = (imageId: string, e: React.MouseEvent) => {
    // Don't open modal if clicking on checkbox
    if ((e.target as HTMLElement).closest("[data-checkbox]")) return;
    setSelectedImageId(imageId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImageId(null);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="solid" textVariant="dark" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="solid" textVariant="dark" />

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-lg">
            <CheckCircle className="size-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {successMessage}
            </span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl mt-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Content Manager
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your event photos and content ({totalImages} total photos)
            </p>
          </div>
          <div>
            <Button onClick={() => router.push("/creator/upload")}>
              Upload New Content
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by event name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Event Filter */}
            <Select
              value={selectedEventFilter}
              onValueChange={setSelectedEventFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as FilterType)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Photos</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortType}
              onValueChange={(value) => setSortType(value as SortType)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="a-z">A - Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedPhotos.size > 0 && (
          <div className="bg-muted mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedPhotos.size === allPhotos.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedPhotos.size} selected
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkDownload}>
                <Download className="mr-2 size-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkMove}>
                <FolderOpen className="mr-2 size-4" />
                Move to Event
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {filteredGroups.length > 0 ? (
          <div className="space-y-8">
            {filteredGroups.map((group) => {
              const eventId = group.event?.id || "uncategorized";
              const eventName = group.event?.name || "Uncategorized";
              const isExpanded = expandedEvents.has(eventId);
              const displayedPhotos = isExpanded
                ? group.images
                : group.images.slice(0, 6);

              return (
                <div key={eventId} className="space-y-3">
                  {/* Event Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{eventName}</h2>
                      <p className="text-muted-foreground text-xs">
                        {group.images.length} photos
                        {group.event && ` - ${formatDate(group.event.date)}`}
                      </p>
                    </div>
                    {group.images.length > 6 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEventExpanded(eventId)}
                        className="gap-2"
                      >
                        {isExpanded ? (
                          <>
                            Show Less
                            <ChevronUp className="size-4" />
                          </>
                        ) : (
                          <>
                            Show More ({group.images.length - 6} more)
                            <ChevronDown className="size-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Photo Grid */}
                  <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                    {displayedPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-sm"
                        onClick={(e) => handleImageClick(photo.id, e)}
                      >
                        {/* Image */}
                        <img
                          src={photo.url || "/placeholder.svg"}
                          alt={photo.description || "Photo"}
                          className="size-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                        />

                        {/* Checkbox Overlay */}
                        <div
                          className={`absolute inset-0 transition-colors ${
                            selectedPhotos.has(photo.id)
                              ? "bg-blue-500/30"
                              : "bg-transparent"
                          }`}
                        >
                          <div
                            className="absolute top-1.5 right-1.5"
                            data-checkbox
                          >
                            <Checkbox
                              checked={selectedPhotos.has(photo.id)}
                              onCheckedChange={() =>
                                togglePhotoSelection(photo.id)
                              }
                              className={`size-5 border-2 transition-all ${
                                selectedPhotos.has(photo.id)
                                  ? "bg-blue-500 border-blue-500"
                                  : "bg-white/80 border-white backdrop-blur-sm"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                {totalImages === 0
                  ? "No photos uploaded yet"
                  : "No photos found matching your criteria"}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                {totalImages === 0
                  ? "Upload your first photos to get started"
                  : "Try adjusting your search or filters"}
              </p>
              {totalImages === 0 && (
                <Button
                  className="mt-4"
                  onClick={() => router.push("/creator/upload")}
                >
                  Upload Photos
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      <ImageDetailModal
        imageId={selectedImageId}
        creatorId={session?.user?.id || ""}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
