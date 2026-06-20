"use client";

import { useState, useRef, useEffect, type DragEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  Plus,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Header } from "@/app/components/Header";
import {
  getEventsList,
  createEvent,
  checkSimilarEvents,
  type EventListItem,
  type SimilarEvent,
} from "@/app/api/actions/event";
import { uploadContent } from "@/app/api/actions/creator";

interface UploadedImage {
  id: string;
  imageId: string; // Auto-generated ID like "KLM2024-001"
  file: File;
  preview: string;
}

export default function UploadContentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [hasFetchedEvents, setHasFetchedEvents] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedEventName, setSelectedEventName] = useState<string>("");
  const [selectedEventDate, setSelectedEventDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imageCounter, setImageCounter] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [similarEvents, setSimilarEvents] = useState<SimilarEvent[]>([]);
  const [isCheckingSimilar, setIsCheckingSimilar] = useState(false);
  const similarCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newEvent, setNewEvent] = useState<{
    name: string;
    date: string;
    location: string;
    thumbnail: File | null;
    thumbnailPreview: string;
  }>({
    name: "",
    date: "",
    location: "",
    thumbnail: null,
    thumbnailPreview: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Generate image ID based on event name and date
  const generateImageId = (
    eventName: string,
    eventDate: string,
    counter: number,
  ): string => {
    // Get initials from event name (first letter of each word, max 3)
    const words = eventName.split(/\s+/).filter(Boolean);
    const initials = words
      .slice(0, 3)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");

    // Get date in YYYYMMDD format
    const date = new Date(eventDate);
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

    // Format counter with leading zeros (001, 002, etc.)
    const counterStr = String(counter).padStart(3, "0");

    return `${initials}${dateStr}-${counterStr}`;
  };

  // Fetch all events when component mounts
  useEffect(() => {
    async function fetchEvents() {
      if (hasFetchedEvents) return;

      setIsLoadingEvents(true);
      try {
        const data = await getEventsList();
        setEvents(data);
        setHasFetchedEvents(true);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    fetchEvents();
  }, [hasFetchedEvents]);

  // Debounced fuzzy duplicate check against the backend (pg_trgm).
  // Runs after the user stops typing; the create button is gated while it's pending.
  const runSimilarCheck = (name: string, date: string) => {
    if (similarCheckTimeout.current) clearTimeout(similarCheckTimeout.current);
    if (!name.trim()) {
      setIsCheckingSimilar(false);
      setSimilarEvents([]);
      return;
    }
    setIsCheckingSimilar(true);
    similarCheckTimeout.current = setTimeout(async () => {
      try {
        const found = await checkSimilarEvents(name, date || undefined);
        setSimilarEvents(found);
      } catch (error) {
        // Fail-open: a flaky check must not block creation (server re-checks anyway).
        console.error("Similar-event check failed:", error);
        setSimilarEvents([]);
      } finally {
        setIsCheckingSimilar(false);
      }
    }, 450);
  };

  // Handle new event name change
  const handleNewEventNameChange = (value: string) => {
    setNewEvent((prev) => ({ ...prev, name: value }));
    runSimilarCheck(value, newEvent.date);
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files || !selectedEventName || !selectedEventDate) return;

    let counter = imageCounter;
    const newImages: UploadedImage[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => {
        const imageId = generateImageId(
          selectedEventName,
          selectedEventDate,
          counter,
        );
        counter++;
        return {
          id: Math.random().toString(36).substring(7),
          imageId,
          file,
          preview: URL.createObjectURL(file),
        };
      });

    setImageCounter(counter);
    setImages((prev) => [...prev, ...newImages]);
  };

  // Handle drag and drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  // Create new event
  // Handle thumbnail selection for new event
  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setNewEvent((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: previewUrl,
      }));
    }
  };

  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    if (newEvent.thumbnailPreview) {
      URL.revokeObjectURL(newEvent.thumbnailPreview);
    }
    setNewEvent((prev) => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: "",
    }));
  };

  const handleCreateEvent = async () => {
    if (!newEvent.name || !newEvent.date || !newEvent.location) return;
    if (!session?.user?.id) return;

    // Don't submit while the duplicate check is still running.
    if (isCheckingSimilar) return;

    setIsCreatingEvent(true);
    try {
      const result = await createEvent({
        name: newEvent.name,
        date: newEvent.date,
        location: newEvent.location,
        createdBy: session.user.id,
        thumbnail: newEvent.thumbnail || undefined,
        // If similar events are already surfaced, this click is a deliberate
        // "Create anyway" → bypass the server guard.
        force: similarEvents.length > 0,
      });

      // Server-side guard tripped (e.g. a race the debounced check missed) —
      // surface the conflicts and let the user confirm with "Create Anyway".
      if (result.status === "similar") {
        setSimilarEvents(result.similarEvents);
        return;
      }

      const created = result.event;

      // Clean up thumbnail preview URL
      if (newEvent.thumbnailPreview) {
        URL.revokeObjectURL(newEvent.thumbnailPreview);
      }

      // Add the new event to the list and select it
      const newEventItem = {
        id: created.id,
        name: created.name,
        date: created.date,
        location: created.location,
        imageCount: 0,
      };
      setEvents((prev) => [newEventItem, ...prev]);
      setSelectedEventId(created.id);
      setSelectedEventName(created.name);
      setSelectedEventDate(created.date);
      setSearchQuery(created.name);
      setIsModalOpen(false);
      setNewEvent({
        name: "",
        date: "",
        location: "",
        thumbnail: null,
        thumbnailPreview: "",
      });
      setSimilarEvents([]);
      setImageCounter(1); // Reset counter for new event
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Submit upload
  const handleSubmit = async () => {
    if (!selectedEventId || images.length === 0) return;
    if (!session?.user?.id) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        const formData = new FormData();
        formData.append("file", image.file);
        formData.append("creatorId", session.user.id);
        formData.append("eventId", selectedEventId);

        await uploadContent(formData);

        setUploadProgress(Math.round(((i + 1) / images.length) * 100));
      }

      // Clear blob URLs
      images.forEach((img) => {
        URL.revokeObjectURL(img.preview);
      });

      // Store success message in sessionStorage for the contents page
      sessionStorage.setItem(
        "uploadSuccessMessage",
        `Successfully uploaded ${images.length} ${images.length === 1 ? "photo" : "photos"} to "${selectedEventName}"`,
      );

      // Redirect to contents page filtered by the event
      router.push(`/creator/contents?event=${selectedEventId}`);
    } catch (error) {
      console.error("Failed to upload images:", error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Filter events based on search
  const filteredEvents = searchQuery.trim()
    ? events.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : events;

  // Handle event selection from suggestions
  const handleSelectEvent = (event: EventListItem) => {
    setSelectedEventId(event.id);
    setSelectedEventName(event.name);
    setSelectedEventDate(event.date);
    setSearchQuery(event.name);
    setShowSuggestions(false);
    setImageCounter(event.imageCount + 1); // Start counter after existing images
  };

  // Handle clearing the selection
  const handleClearSelection = () => {
    setSelectedEventId("");
    setSelectedEventName("");
    setSelectedEventDate("");
    setSearchQuery("");
    setShowSuggestions(false);
    setImages([]); // Clear images when event is cleared
    setImageCounter(1);
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
    // If user clears or modifies the search, clear the selection
    if (selectedEventId && value !== selectedEventName) {
      setSelectedEventId("");
      setSelectedEventName("");
      setSelectedEventDate("");
      setImages([]); // Clear images when event changes
      setImageCounter(1);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        const suggestionsEl = document.getElementById("event-suggestions");
        if (suggestionsEl && !suggestionsEl.contains(e.target as Node)) {
          setShowSuggestions(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canSubmit = selectedEventId && images.length > 0 && !isUploading;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header variant="solid" textVariant="dark" />
      <div className="mx-auto mt-6 max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Upload Photos</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Add your event photos to the gallery
          </p>
        </div>

        {/* Event Selection Area */}
        <Card className="mb-8 p-6">
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="event-search"
                className="mb-2 text-base font-semibold"
              >
                Select Event
              </Label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="relative">
                    <Input
                      ref={searchInputRef}
                      id="event-search"
                      type="text"
                      placeholder={
                        isLoadingEvents
                          ? "Loading events..."
                          : "Search or select an event..."
                      }
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      disabled={isLoadingEvents}
                      className={`pr-10 ${selectedEventId ? "border-cyan-400 bg-cyan-50" : ""}`}
                    />
                    {selectedEventId ? (
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="size-4" />
                      </button>
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && !isLoadingEvents && (
                    <div
                      id="event-suggestions"
                      className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-64 overflow-y-auto"
                    >
                      {filteredEvents.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-gray-500 mb-3">
                            {searchQuery.trim()
                              ? `No events found for "${searchQuery}"`
                              : "No events yet"}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowSuggestions(false);
                              setIsModalOpen(true);
                            }}
                          >
                            <Plus className="mr-2 size-3" />
                            Create New Event
                          </Button>
                        </div>
                      ) : (
                        <>
                          {filteredEvents.slice(0, 8).map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => handleSelectEvent(event)}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                                selectedEventId === event.id ? "bg-cyan-50" : ""
                              }`}
                            >
                              <div className="font-medium text-gray-900">
                                {event.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {formatDate(event.date)} • {event.location} •{" "}
                                {event.imageCount} photos
                              </div>
                            </button>
                          ))}
                          {filteredEvents.length > 8 && (
                            <div className="px-4 py-2 text-xs text-gray-400 text-center bg-gray-50">
                              {filteredEvents.length - 8} more events match your
                              search
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Selected Event Indicator */}
                  {selectedEventId && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-cyan-600">
                      <div className="size-2 rounded-full bg-cyan-400" />
                      <span>
                        Event selected: <strong>{selectedEventName}</strong>
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                  className="shrink-0"
                >
                  <Plus className="mr-2 size-4" />
                  New Event
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Upload Area */}
        <Card className="mb-8 p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              !selectedEventId
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
          >
            <Upload
              className={`mx-auto mb-4 size-12 ${!selectedEventId ? "text-gray-300" : "text-muted-foreground"}`}
            />
            <p
              className={`mb-2 text-lg font-medium ${!selectedEventId ? "text-gray-400" : ""}`}
            >
              {selectedEventId
                ? "Drag & drop images here"
                : "Select an event first"}
            </p>
            <p
              className={`mb-4 text-sm ${!selectedEventId ? "text-gray-400" : "text-muted-foreground"}`}
            >
              {selectedEventId
                ? "or click the button below to select files"
                : "You need to select an event before uploading photos"}
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={!selectedEventId}
            >
              Select Images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={!selectedEventId}
            />
          </div>
        </Card>

        {/* Preview Grid */}
        {images.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">
              Preview ({images.length}{" "}
              {images.length === 1 ? "image" : "images"})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg overflow-hidden border bg-white shadow-sm"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                    aria-label="Remove image"
                  >
                    <X className="size-4" />
                  </button>

                  {/* Image Preview */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.preview || "/placeholder.svg"}
                      alt="Preview"
                      className="size-full object-cover"
                    />
                  </div>

                  {/* Image ID Badge */}
                  <div className="p-2 bg-gray-50 border-t">
                    <p
                      className="text-xs font-mono text-gray-600 truncate"
                      title={image.imageId}
                    >
                      {image.imageId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted-foreground">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            size="lg"
            className="min-w-[200px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>Upload {images.length > 0 && `(${images.length})`}</>
            )}
          </Button>
        </div>
      </div>

      {/* Create New Event Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Add a new event to upload photos to. Make sure it doesn&apos;t
              already exist.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Checking indicator */}
            {isCheckingSimilar && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin" />
                Checking for similar events…
              </div>
            )}

            {/* Duplicate Warning */}
            {!isCheckingSimilar && similarEvents.length > 0 && (
              <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-600 dark:text-yellow-500" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-400">
                    {similarEvents.length === 1
                      ? "A similar event already exists"
                      : `${similarEvents.length} similar events already exist`}
                  </p>
                  <ul className="mt-1 space-y-0.5 text-yellow-700 dark:text-yellow-500">
                    {similarEvents.map((ev) => (
                      <li key={ev.id}>
                        • {ev.name}
                        {ev.location ? ` — ${ev.location}` : ""}
                        {ev.date
                          ? ` (${new Date(ev.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })})`
                          : ""}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-yellow-700 dark:text-yellow-500">
                    You can still create it with &ldquo;Create Anyway&rdquo;.
                  </p>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="event-name">Event Name *</Label>
              <Input
                id="event-name"
                type="text"
                placeholder="e.g., Tech Conference 2025"
                value={newEvent.name}
                onChange={(e) => handleNewEventNameChange(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="event-date">Date *</Label>
              <Input
                id="event-date"
                type="date"
                value={newEvent.date}
                onChange={(e) => {
                  const date = e.target.value;
                  setNewEvent((prev) => ({ ...prev, date }));
                  runSimilarCheck(newEvent.name, date);
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="event-location">Location *</Label>
              <Input
                id="event-location"
                type="text"
                placeholder="e.g., Convention Center"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {/* Thumbnail Upload */}
            <div>
              <Label>Event Thumbnail (Optional)</Label>
              <div className="mt-1">
                {newEvent.thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={newEvent.thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-32 w-48 rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="flex h-32 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                  >
                    <Upload className="mb-2 size-6 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Click to upload
                    </span>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                if (newEvent.thumbnailPreview) {
                  URL.revokeObjectURL(newEvent.thumbnailPreview);
                }
                setNewEvent({
                  name: "",
                  date: "",
                  location: "",
                  thumbnail: null,
                  thumbnailPreview: "",
                });
                setSimilarEvents([]);
                setIsCheckingSimilar(false);
                if (similarCheckTimeout.current) {
                  clearTimeout(similarCheckTimeout.current);
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={
                !newEvent.name ||
                !newEvent.date ||
                !newEvent.location ||
                isCreatingEvent ||
                isCheckingSimilar
              }
            >
              {isCreatingEvent ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : isCheckingSimilar ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Checking...
                </>
              ) : similarEvents.length > 0 ? (
                "Create Anyway"
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
