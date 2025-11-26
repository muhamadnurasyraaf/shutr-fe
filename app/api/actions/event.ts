import { getServerAPI } from "@/lib/server-api";

const api = await getServerAPI();

export async function getLandingPageData() {
  const response = await api.get("/landing");
  return response.data;
}
