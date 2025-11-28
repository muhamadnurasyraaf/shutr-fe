"use client";

import axios from "axios";
import { useSession } from "next-auth/react";

export function useClientAPI() {
  const { data: session } = useSession();

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return api;
}
