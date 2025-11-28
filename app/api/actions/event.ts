import { useClientAPI } from "@/lib/client-api";
import { getServerAPI } from "@/lib/server-api";

const serverApi = await getServerAPI();

export async function getLandingPageData() {
  const response = await serverApi.get("/landing");
  return response.data;
}
