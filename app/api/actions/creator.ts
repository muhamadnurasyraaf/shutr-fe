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
  bibNumber: string | null;
  plateNumber: string | null;
  creatorId: string;
  eventId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedVariant {
  id: string;
  imageId: string;
  url: string | null;
  name: string;
  description: string | null;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedImageWithVariants extends UploadedImage {
  variants: UploadedVariant[];
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

export interface VariantInput {
  name: string;
  description?: string;
  price: number;
}

export async function uploadContentWithVariants(
  formData: FormData,
): Promise<UploadedImageWithVariants> {
  const api = await getServerAPI();
  const response = await api.post("/creator/upload-with-variants", formData, {
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

export type PhotographyType = "Marathon" | "Wildlife" | "Motorsports";

export interface Photographer {
  id: string;
  name: string | null;
  displayName: string | null;
  avatar: string | null;
  email: string;
  photographyType: PhotographyType | null;
  location: string | null;
  bio: string | null;
  eventsCount: number;
  imagesCount: number;
}

export interface PhotographersResponse {
  data: Photographer[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function fetchPhotographers(
  photographyType?: PhotographyType,
  page: number = 1,
  limit: number = 9,
): Promise<PhotographersResponse> {
  const api = await getServerAPI();
  const params: Record<string, string | number> = { page, limit };
  if (photographyType) {
    params.photographyType = photographyType;
  }
  const response = await api.get("/creator/photographers", { params });
  return response.data;
}

// Photographer public profile types
export interface PhotographerProfile {
  id: string;
  name: string | null;
  displayName: string | null;
  avatar: string | null;
  email: string;
  photographyType: PhotographyType | null;
  location: string | null;
  bio: string | null;
  eventsCount: number;
  imagesCount: number;
  memberSince: string;
}

export interface PhotographerEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  thumbnailUrl: string | null;
  photoCount: number;
}

export interface PhotographerProfileResponse {
  photographer: PhotographerProfile;
  events: PhotographerEvent[];
  totalImages: number;
  eventGroups: EventGroup[];
}

export async function fetchPhotographerProfile(
  photographerId: string,
  eventId?: string,
): Promise<PhotographerProfileResponse | null> {
  const api = await getServerAPI();
  const params: Record<string, string> = {};
  if (eventId) {
    params.eventId = eventId;
  }
  try {
    const response = await api.get(`/creator/photographer/${photographerId}`, {
      params,
    });
    return response.data;
  } catch {
    return null;
  }
}

// Image with variants types
export interface ImageVariant {
  id: string;
  url: string | null;
  name: string;
  description: string | null;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageWithVariants {
  id: string;
  url: string;
  description: string | null;
  bibNumber: string | null;
  plateNumber: string | null;
  creatorId: string;
  eventId: string | null;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    name: string;
    date: string;
    location: string;
  } | null;
  variants: ImageVariant[];
}

export async function fetchImageWithVariants(
  imageId: string,
  creatorId: string,
): Promise<ImageWithVariants | null> {
  const api = await getServerAPI();
  try {
    const response = await api.get(`/creator/image/${imageId}`, {
      params: { creatorId },
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function updateVariant(
  variantId: string,
  creatorId: string,
  data: { name?: string; description?: string; price?: number },
): Promise<ImageVariant | null> {
  const api = await getServerAPI();
  try {
    const response = await api.put(`/creator/variant/${variantId}`, {
      creatorId,
      ...data,
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function deleteVariant(
  variantId: string,
  creatorId: string,
): Promise<boolean> {
  const api = await getServerAPI();
  try {
    await api.post(`/creator/variant/${variantId}/delete`, { creatorId });
    return true;
  } catch {
    return false;
  }
}
