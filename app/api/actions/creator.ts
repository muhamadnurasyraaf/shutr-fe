"use server";

import { getServerAPI } from "@/lib/server-api";

export async function fetchCreatorProfile(userId: string) {
  const api = await getServerAPI();
  const response = await api.get(`/creator/profile?userId=${userId}`);
  return response.data;
}

export interface UploadContentPayload {
  file: File;
  creatorId: string;
  eventId?: string;
  description?: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  description: string | null;
  creatorId: string;
  eventId: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function uploadContent(
  formData: FormData,
): Promise<UploadedImage> {
  const api = await getServerAPI();
  const response = await api.post("/creator/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export interface ContentImage {
  id: string;
  url: string;
  description: string | null;
  createdAt: string;
}

export interface ContentEvent {
  id: string;
  name: string;
  date: string;
  location: string;
}

export interface EventGroup {
  event: ContentEvent | null;
  images: ContentImage[];
}

export interface CreatorContentsResponse {
  totalImages: number;
  eventGroups: EventGroup[];
}

export async function fetchCreatorContents(
  userId: string,
  eventId?: string,
): Promise<CreatorContentsResponse> {
  const api = await getServerAPI();
  const params: Record<string, string> = { userId };
  if (eventId) {
    params.eventId = eventId;
  }
  const response = await api.get("/creator/contents", { params });
  return response.data;
}
