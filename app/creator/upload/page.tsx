"use client";

import { useState, useRef, useEffect, type DragEvent } from "react";
import { useSession } from "next-auth/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, X, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { Header } from "@/app/components/Header";
import {
  getEventsList,
  createEvent,
  type EventListItem,
} from "@/app/api/actions/event";
import { uploadContent } from "@/app/api/actions/creator";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  caption: string;
  tag: string;
}

export default function UploadContentPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [hasFetchedEvents, setHasFetchedEvents] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateEventName, setDuplicateEventName] = useState("");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Calculate similarity percentage (simple Levenshtein-based approach)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 100;

    const editDistance = (s1: string, s2: string): number => {
      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();
      const costs: number[] = [];

      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
          if (i === 0) {
            costs[j] = j;
          } else if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
        if (i > 0) costs[s2.length] = lastValue;
      }

      return costs[s2.length];
    };

    return (
      ((longer.length - editDistance(longer, shorter)) / longer.length) * 100
    );
  };

  // Check for duplicate events
  const checkDuplicateEvent = (eventName: string): string | null => {
    for (const event of events) {
      const similarity = calculateSimilarity(eventName, event.name);
      if (similarity >= 90) {
        return event.name;
      }
    }
    return null;
  };

  // Handle new event name change
  const handleNewEventNameChange = (value: string) => {
    setNewEvent({ ...newEvent, name: value });

    if (value.trim()) {
      const duplicate = checkDuplicateEvent(value);
      if (duplicate) {
        setDuplicateEventName(duplicate);
        setShowDuplicateWarning(true);
      } else {
        setShowDuplicateWarning(false);
      }
    } else {
      setShowDuplicateWarning(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        caption: "",
        tag: "",
      }));

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
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  // Update image metadata
  const updateImage = (id: string, field: "caption" | "tag", value: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [field]: value } : img)),
    );
  };

  // Create new event
  const handleCreateEvent = async () => {
    if (!newEvent.name || !newEvent.date || !newEvent.location) return;
    if (!session?.user?.id) return;

    setIsCreatingEvent(true);
    try {
      const created = await createEvent({
        name: newEvent.name,
        date: newEvent.date,
        location: newEvent.location,
        createdBy: session.user.id,
      });

      // Add the new event to the list and select it
      setEvents((prev) => [
        {
          id: created.id,
          name: created.name,
          date: created.date,
          location: created.location,
          imageCount: 0,
        },
        ...prev,
      ]);
      setSelectedEventId(created.id);
      setIsModalOpen(false);
      setNewEvent({ name: "", date: "", location: "" });
      setShowDuplicateWarning(false);
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
        if (image.caption) {
          formData.append("description", image.caption);
        }

        await uploadContent(formData);
        setUploadProgress(Math.round(((i + 1) / images.length) * 100));
      }

      // Clear images after successful upload
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
      setSelectedEventId("");
    } catch (error) {
      console.error("Failed to upload images:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Filter events based on search
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
                <div className="flex-1">
                  <Input
                    id="event-search"
                    type="text"
                    placeholder="Search events by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-2"
                  />
                  <Select
                    value={selectedEventId}
                    onValueChange={setSelectedEventId}
                    disabled={isLoadingEvents}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isLoadingEvents
                            ? "Loading events..."
                            : "Choose an event..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredEvents.length === 0 ? (
                        <div className="text-muted-foreground px-2 py-4 text-center text-sm">
                          No events found. Create one to get started.
                        </div>
                      ) : (
                        filteredEvents.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{event.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {formatDate(event.date)} - {event.location}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                  className="shrink-0"
                >
                  <Plus className="mr-2 size-4" />
                  Create New Event
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
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
          >
            <Upload className="text-muted-foreground mx-auto mb-4 size-12" />
            <p className="mb-2 text-lg font-medium">Drag & drop images here</p>
            <p className="text-muted-foreground mb-4 text-sm">
              or click the button below to select files
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <Card
                  key={image.id}
                  className="group relative overflow-hidden transition-transform hover:scale-[1.02]"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-destructive/90 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="size-4" />
                  </button>

                  {/* Image Preview */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image.preview || "/placeholder.svg"}
                      alt="Preview"
                      className="size-full object-cover"
                    />
                  </div>

                  {/* Metadata Fields */}
                  <div className="space-y-3 p-4">
                    <div>
                      <Label
                        htmlFor={`caption-${image.id}`}
                        className="text-xs"
                      >
                        Caption (optional)
                      </Label>
                      <Input
                        id={`caption-${image.id}`}
                        type="text"
                        placeholder="Add a caption..."
                        value={image.caption}
                        onChange={(e) =>
                          updateImage(image.id, "caption", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`tag-${image.id}`} className="text-xs">
                        Tag (optional)
                      </Label>
                      <Select
                        value={image.tag}
                        onValueChange={(value) =>
                          updateImage(image.id, "tag", value)
                        }
                      >
                        <SelectTrigger id={`tag-${image.id}`} className="mt-1">
                          <SelectValue placeholder="Select a tag..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="crowd-shot">Crowd Shot</SelectItem>
                          <SelectItem value="booth">Booth</SelectItem>
                          <SelectItem value="speaker">Speaker</SelectItem>
                          <SelectItem value="venue">Venue</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
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
            {/* Duplicate Warning */}
            {showDuplicateWarning && (
              <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-600 dark:text-yellow-500" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-400">
                    Similar event found
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-500">
                    This event already exists: &quot;{duplicateEventName}&quot;.
                    Are you sure you want to create a new one?
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
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
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
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setNewEvent({ name: "", date: "", location: "" });
                setShowDuplicateWarning(false);
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
                isCreatingEvent
              }
            >
              {isCreatingEvent ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
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
