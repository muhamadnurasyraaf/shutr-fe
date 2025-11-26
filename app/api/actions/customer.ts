import { getServerAPI } from "@/lib/server-api";

const api = await getServerAPI();

export async function fetchCustomerContents() {
  const response = await api.get("/customer/contents");
  return response.data;
}
