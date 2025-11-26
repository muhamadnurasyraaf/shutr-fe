import { getServerAPI } from "@/lib/server-api";

const api = await getServerAPI();

export async function fetchCreatorProfile(userId: string) {
  const response = await api.get(`/creator/profile?userId=${userId}`);
  return response.data;
}

export async function uploadContent(data: { image: File }) {}

export async function fetchCreatorContents() {
  const response = await api.get("/creator/contents");
  return response.data;
}
