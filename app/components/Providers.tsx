"use client";

import { SessionProvider } from "next-auth/react";
import { ProfileCompletionProvider } from "@/app/contexts/ProfileCompletionContext";
import { UploadProvider } from "@/app/contexts/UploadContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileCompletionProvider>
        <UploadProvider>{children}</UploadProvider>
      </ProfileCompletionProvider>
    </SessionProvider>
  );
}
