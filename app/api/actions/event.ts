"use server";

import { getServerAPI } from "@/lib/server-api";

// Fallback data when API is unavailable
const FALLBACK_LANDING_DATA = {
  recentEvents: [
    {
      id: "fallback-1",
      name: "KL Marathon 2024",
      description: "Annual Kuala Lumpur Marathon",
      date: new Date().toISOString(),
      thumbnailUrl: null,
      location: "Kuala Lumpur",
    },
    {
      id: "fallback-2",
      name: "Penang Bridge Run",
      description: "Scenic bridge run event",
      date: new Date().toISOString(),
      thumbnailUrl: null,
      location: "Penang",
    },
    {
      id: "fallback-3",
      name: "Johor Cycling Challenge",
      description: "Cycling event across Johor",
      date: new Date().toISOString(),
      thumbnailUrl: null,
      location: "Johor Bahru",
    },
  ],
  topPhotographers: [
    {
      id: "fallback-p1",
      email: "photographer@example.com",
      name: "Featured Photographer",
      displayName: "Pro Shooter",
      creatorInfo: { location: "Kuala Lumpur" },
    },
    {
      id: "fallback-p2",
      email: "photographer2@example.com",
      name: "Sports Capture",
      displayName: "Sports Capture",
      creatorInfo: { location: "Selangor" },
    },
    {
      id: "fallback-p3",
      email: "photographer3@example.com",
      name: "Event Lens",
      displayName: "Event Lens",
      creatorInfo: { location: "Penang" },
    },
    {
      id: "fallback-p4",
      email: "photographer4@example.com",
      name: "Action Shots",
      displayName: "Action Shots",
      creatorInfo: { location: "Johor" },
    },
    {
      id: "fallback-p5",
      email: "photographer5@example.com",
      name: "Marathon Pro",
      displayName: "Marathon Pro",
      creatorInfo: { location: "Melaka" },
    },
  ],
  isFallback: true,
};

export async function getLandingPageData() {
  try {
    const serverApi = await getServerAPI();
    const response = await serverApi.get("/landing");
    return { ...response.data, isFallback: false };
  } catch (error) {
    console.error("Failed to fetch landing page data, using fallback:", error);
    return FALLBACK_LANDING_DATA;
  }
}

export interface ImageVariant {
  id: string;
  url: string;
  name: string;
  description: string | null;
  price: number;
}

export interface EventImage {
  id: string;
  url: string;
  description: string | null;
  createdAt: string;
  creator: {
    id: string;
    name: string | null;
    displayName: string | null;
    image: string | null;
  };
  variants: ImageVariant[];
}

export interface EventDetails {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string;
  thumbnailUrl: string | null;
  creator: {
    id: string;
    name: string | null;
    displayName: string | null;
    image: string | null;
  };
  imageCount: number;
}

export interface EventImagesResponse {
  event: EventDetails;
  images: EventImage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function getEventImages(
  eventId: string,
  page: number = 1,
  limit: number = 20,
): Promise<EventImagesResponse> {
  const serverApi = await getServerAPI();
  const response = await serverApi.get(`/event/${eventId}/images`, {
    params: { page, limit },
  });
  return response.data;
}

export interface EventListItem {
  id: string;
  name: string;
  date: string;
  location: string;
  imageCount: number;
}

export async function getEventsList(search?: string): Promise<EventListItem[]> {
  const serverApi = await getServerAPI();
  const response = await serverApi.get("/event/list", {
    params: search ? { search } : undefined,
  });
  return response.data;
}

export interface SimilarEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  thumbnailUrl: string | null;
  similarity: number;
}

/**
 * Fuzzy duplicate check against existing events (backend pg_trgm).
 * Used by the create-event form, debounced after the user stops typing.
 */
export async function checkSimilarEvents(
  name: string,
  date?: string,
): Promise<SimilarEvent[]> {
  if (!name?.trim()) return [];
  const serverApi = await getServerAPI();
  const response = await serverApi.get("/event/check-similar", {
    params: { name: name.trim(), ...(date ? { date } : {}) },
  });
  return response.data?.similarEvents ?? [];
}

export interface CreateEventPayload {
  name: string;
  category?: string;
  date: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string;
  createdBy: string;
  thumbnail?: File;
  // Bypass the server-side duplicate guard and create anyway.
  force?: boolean;
  // Publish immediately (true) or save as a draft (false).
  publish?: boolean;
  // Watermark configuration for previews.
  watermarkMode?: "default" | "custom" | "none";
  watermarkText?: string;
  watermarkLogoPublicId?: string;
}

export type CreateEventResult =
  | {
      status: "created";
      event: {
        id: string;
        name: string;
        date: string;
        location: string;
        thumbnailUrl?: string;
        status?: string;
        category?: string;
      };
    }
  | { status: "similar"; similarEvents: SimilarEvent[] };

export async function createEvent(
  payload: CreateEventPayload,
): Promise<CreateEventResult> {
  const serverApi = await getServerAPI();

  // Use FormData to support file upload
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("date", payload.date);
  formData.append("location", payload.location);
  formData.append("createdBy", payload.createdBy);

  if (payload.category) formData.append("category", payload.category);
  if (payload.latitude != null)
    formData.append("latitude", String(payload.latitude));
  if (payload.longitude != null)
    formData.append("longitude", String(payload.longitude));
  if (payload.description) formData.append("description", payload.description);
  if (payload.thumbnail) formData.append("thumbnail", payload.thumbnail);
  if (payload.force) formData.append("force", "true");
  // Default publish=true on the backend; only send when saving a draft.
  if (payload.publish === false) formData.append("publish", "false");
  if (payload.watermarkMode)
    formData.append("watermarkMode", payload.watermarkMode);
  if (payload.watermarkText)
    formData.append("watermarkText", payload.watermarkText);
  if (payload.watermarkLogoPublicId)
    formData.append("watermarkLogoPublicId", payload.watermarkLogoPublicId);

  try {
    const response = await serverApi.post("/event", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { status: "created", event: response.data };
  } catch (error: any) {
    // Server-side duplicate guard tripped — surface the conflicts instead of throwing.
    const data = error?.response?.data;
    if (
      error?.response?.status === 400 &&
      data?.code === "SIMILAR_EVENT_EXISTS"
    ) {
      return { status: "similar", similarEvents: data.similarEvents ?? [] };
    }
    throw error;
  }
}
