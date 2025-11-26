import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";
import { getServerSession } from "next-auth";

export async function getServerAPI() {
  const session = await getServerSession(authOptions);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
      ...(session?.backendToken && {
        Authorization: `Bearer ${session.backendToken}`,
      }),
    },
  });

  return api;
}
