"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface CompletedSections {
  personal: boolean;
  professional: boolean;
  banking: boolean;
}

interface ProfileCompletionContextType {
  completedSections: CompletedSections;
  isProfileComplete: boolean;
  isLoading: boolean;
  setCompletedSections: (sections: CompletedSections) => void;
  refreshProfileStatus: () => Promise<void>;
}

const ProfileCompletionContext = createContext<ProfileCompletionContextType | undefined>(undefined);

export function ProfileCompletionProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [completedSections, setCompletedSections] = useState<CompletedSections>({
    personal: false,
    professional: false,
    banking: false,
  });

  const isProfileComplete =
    completedSections.personal &&
    completedSections.professional &&
    completedSections.banking;

  const fetchProfileStatus = useCallback(async () => {
    if (!session?.user?.id || session?.user?.type !== "Creator") {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/creator/profile-status/${session.user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setCompletedSections({
          personal: data.personal ?? false,
          professional: data.professional ?? false,
          banking: data.banking ?? false,
        });
      }
    } catch (error) {
      console.error("Error fetching profile status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, session?.user?.type]);

  const refreshProfileStatus = useCallback(async () => {
    await fetchProfileStatus();
  }, [fetchProfileStatus]);

  useEffect(() => {
    fetchProfileStatus();
  }, [fetchProfileStatus]);

  return (
    <ProfileCompletionContext.Provider
      value={{
        completedSections,
        isProfileComplete,
        isLoading,
        setCompletedSections,
        refreshProfileStatus,
      }}
    >
      {children}
    </ProfileCompletionContext.Provider>
  );
}

export function useProfileCompletion() {
  const context = useContext(ProfileCompletionContext);
  if (context === undefined) {
    throw new Error(
      "useProfileCompletion must be used within a ProfileCompletionProvider"
    );
  }
  return context;
}
