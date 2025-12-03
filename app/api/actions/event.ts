"use server";

import { getServerAPI } from "@/lib/server-api";

export async function getLandingPageData() {
  const serverApi = await getServerAPI();
  const response = await serverApi.get("/landing");
  return response.data;
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
}

export async function createEvent(
  payload: CreateEventPayload,
): Promise<{ id: string; name: string; date: string; location: string }> {
  const serverApi = await getServerAPI();
  const response = await serverApi.post("/event", payload);
  return response.data;
}
