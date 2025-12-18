"use client";

import { SessionProvider } from "next-auth/react";
import { ProfileCompletionProvider } from "@/app/contexts/ProfileCompletionContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileCompletionProvider>{children}</ProfileCompletionProvider>
    </SessionProvider>
  );
}
