"use server";

import { getServerAPI } from "@/lib/server-api";

export interface CustomerProfile {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  image: string | null;
  type: "Creator" | "Customer";
  createdAt: string;
}

export interface UpdateCustomerProfilePayload {
  userId: string;
  name: string;
  displayName: string;
  phoneNumber: string;
}

export async function fetchCustomerContents() {
  const api = await getServerAPI();
  const response = await api.get("/customer/contents");
  return response.data;
}

export async function fetchCustomerProfile(
  userId: string
): Promise<CustomerProfile> {
  const api = await getServerAPI();
  const response = await api.get(`/customer/profile?userId=${userId}`);
  return response.data;
}

export async function updateCustomerProfile(
  payload: UpdateCustomerProfilePayload
): Promise<CustomerProfile> {
  const api = await getServerAPI();
  const response = await api.put("/customer/profile", payload);
  return response.data;
}
