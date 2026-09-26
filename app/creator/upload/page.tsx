"use client";

import { useState, useRef, useEffect, type DragEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, Plus, ChevronDown } from "lucide-react";
import { Header } from "@/app/components/Header";
import { type EventListItem } from "@/app/api/actions/event";
import { getMyEvents } from "@/lib/creator-events";
import { useUploads } from "@/app/contexts/UploadContext";
import CreateEventWizard from "./CreateEventWizard";

interface UploadedImage {
  id: string;
  imageId: string; // Auto-generated ID like "KLM2024-001"
  file: File;
  preview: string;
}

type Mode = "select" | "create";

export default function UploadContentPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // "select" = upload into an existing event; "create" = new-event wizard.
  const [mode, setMode] = useState<Mode>("select");

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
  const { enqueue } = useUploads();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate image ID based on event name and date
  const generateImageId = (
    eventName: string,
    eventDate: string,
    counter: number,
  ): string => {
    const words = eventName.split(/\s+/).filter(Boolean);
    const initials = words
      .slice(0, 3)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");

    const date = new Date(eventDate);
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const counterStr = String(counter).padStart(3, "0");

    return `${initials}${dateStr}-${counterStr}`;
  };

  const userId = session?.user?.id;

  // Load only the signed-in creator's own events — an event is owned by its
  // creator and only they can upload to it.
  useEffect(() => {
    const uid = userId;
    if (!uid || hasFetchedEvents) return;

    (async () => {
      setIsLoadingEvents(true);
      try {
        const { data } = await getMyEvents(uid);
        setEvents(
          data.map((e) => ({
            id: e.id,
            name: e.name,
            date: e.date,
            location: e.location,
            imageCount: e._count?.images ?? 0,
          })),
        );
        setHasFetchedEvents(true);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    })();
  }, [userId, hasFetchedEvents]);

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

  // Submit upload — hand the files to the background upload manager and leave.
  // Uploads continue (with progress in the tray) even after we navigate away,
  // so the photographer can immediately queue another event's photos.
  const handleSubmit = () => {
    if (!selectedEventId || images.length === 0) return;
    if (!session?.user?.id) return;

    enqueue(
      images.map((img) => img.file),
      { eventId: selectedEventId, eventName: selectedEventName },
    );

    // The manager owns the File objects now; drop local previews and reset.
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setImageCounter(1);

    sessionStorage.setItem(
      "uploadSuccessMessage",
      `Uploading ${images.length} ${images.length === 1 ? "photo" : "photos"} to "${selectedEventName}" — track progress in the tray.`,
    );

    router.push(`/creator/contents?event=${selectedEventId}`);
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
    setImages([]);
    setImageCounter(1);
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
    if (selectedEventId && value !== selectedEventName) {
      setSelectedEventId("");
      setSelectedEventName("");
      setSelectedEventDate("");
      setImages([]);
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

  const canSubmit = !!selectedEventId && images.length > 0;

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
      <div className="mx-auto mt-6 max-w-5xl px-4 py-12 pt-24 sm:px-6 lg:px-8">
        {mode === "create" ? (
          <CreateEventWizard onCancel={() => setMode("select")} />
        ) : (
          <>
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold tracking-tight">
                Upload Photos
              </h1>
              <p className="text-muted-foreground mt-3 text-lg">
                Add your photos to an event — or create a new one
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
                                  setMode("create");
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
                                    selectedEventId === event.id
                                      ? "bg-cyan-50"
                                      : ""
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
                                  {filteredEvents.length - 8} more events match
                                  your search
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
                      onClick={() => setMode("create")}
                      className="shrink-0"
                    >
                      <Plus className="mr-2 size-4" />
                      New Event
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Upload Area — condenses once images are added */}
            <Card className="mb-8 p-8">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg text-center transition-all ${
                  images.length > 0 ? "p-5" : "p-12"
                } ${
                  !selectedEventId
                    ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                    : isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
              >
                {images.length > 0 ? (
                  // Compact state: confirms the drop landed + shows the count.
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-cyan-400 text-black text-xs font-bold">
                        {images.length}
                      </span>
                      {images.length === 1 ? "image added" : "images added"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      — drop more or
                    </span>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      disabled={!selectedEventId}
                    >
                      Add more
                    </Button>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        aria-label="Remove image"
                      >
                        <X className="size-4" />
                      </button>

                      <div className="aspect-square overflow-hidden">
                        <img
                          src={image.preview || "/placeholder.svg"}
                          alt="Preview"
                          className="size-full object-cover"
                        />
                      </div>

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


            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                size="lg"
                className="min-w-[200px]"
              >
                Upload {images.length > 0 && `(${images.length})`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
