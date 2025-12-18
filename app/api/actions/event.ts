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

export interface CreateEventPayload {
  name: string;
  date: string;
  location: string;
  description?: string;
  createdBy: string;
  thumbnail?: File;
}

export async function createEvent(payload: CreateEventPayload): Promise<{
  id: string;
  name: string;
  date: string;
  location: string;
  thumbnailUrl?: string;
}> {
  const serverApi = await getServerAPI();

  // Use FormData to support file upload
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("date", payload.date);
  formData.append("location", payload.location);
  formData.append("createdBy", payload.createdBy);

  if (payload.description) {
    formData.append("description", payload.description);
  }

  if (payload.thumbnail) {
    formData.append("thumbnail", payload.thumbnail);
  }

  const response = await serverApi.post("/event", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
