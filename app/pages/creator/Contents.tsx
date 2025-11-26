"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
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
import { Search, Download, Trash2, FolderOpen } from "lucide-react";

// Sample data
const samplePhotos = [
  {
    id: 1,
    eventName: "Tech Expo 2025",
    imageUrl: "/thumbnail.png",
    uploadedAt: "2025-07-05T10:00:00Z",
    status: "Published",
  },
  {
    id: 2,
    eventName: "Food Carnival",
    imageUrl: "/thumbnail.png",
    uploadedAt: "2025-06-28T15:30:00Z",
    status: "Pending",
  },
  {
    id: 3,
    eventName: "Music Fest",
    imageUrl: "/thumbnail.png",
    uploadedAt: "2025-07-01T13:20:00Z",
    status: "Published",
  },
];

type FilterType = "all" | "recent" | "pending" | "published";
type SortType = "newest" | "oldest" | "a-z";

export default function CreatorContentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("newest");
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());

  // Filter and sort logic
  const filteredAndSortedPhotos = useMemo(() => {
    let filtered = [...samplePhotos];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((photo) =>
        photo.eventName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterType === "pending") {
      filtered = filtered.filter((photo) => photo.status === "Pending");
    } else if (filterType === "published") {
      filtered = filtered.filter((photo) => photo.status === "Published");
    } else if (filterType === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(
        (photo) => new Date(photo.uploadedAt) > sevenDaysAgo
      );
    }

    // Apply sorting
    if (sortType === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    } else if (sortType === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      );
    } else if (sortType === "a-z") {
      filtered.sort((a, b) => a.eventName.localeCompare(b.eventName));
    }

    return filtered;
  }, [searchQuery, filterType, sortType]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const togglePhotoSelection = (id: number) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPhotos(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPhotos.size === filteredAndSortedPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(filteredAndSortedPhotos.map((p) => p.id)));
    }
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Content Manager</h1>
          <p className="text-muted-foreground mt-2">
            Manage your event photos and content
          </p>
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
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as FilterType)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
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
                <SelectItem value="a-z">A → Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedPhotos.size > 0 && (
          <div className="bg-muted mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedPhotos.size === filteredAndSortedPhotos.length}
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

        {/* Photo Grid */}
        {filteredAndSortedPhotos.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedPhotos.map((photo) => (
              <Card
                key={photo.id}
                className="group relative overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <Checkbox
                    checked={selectedPhotos.has(photo.id)}
                    onCheckedChange={() => togglePhotoSelection(photo.id)}
                    className="bg-background/80 backdrop-blur-sm"
                  />
                </div>

                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.imageUrl || "/placeholder.svg"}
                    alt={photo.eventName}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="mb-2 font-semibold text-lg">
                    {photo.eventName}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      {formatDate(photo.uploadedAt)}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        photo.status === "Published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {photo.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                No photos found matching your criteria
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
