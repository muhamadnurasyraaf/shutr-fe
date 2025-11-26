import { getServerAPI } from "@/lib/server-api";

const api = await getServerAPI();

export async function getLandingPageData() {
  const response = await api.get("/landing");
  console.log(`Landing Page Data :${JSON.stringify(response.data, null, 2)}`);
  return response.data;
}
