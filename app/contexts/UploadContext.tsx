"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import {
  getUploadSignature,
  uploadToCloudinary,
  registerImage,
  type UploadSignature,
} from "@/lib/uploads";
import { UploadTray } from "@/components/upload/UploadTray";

export type UploadStatus = "queued" | "uploading" | "done" | "error";

export interface UploadTask {
  id: string;
  eventId: string;
  eventName: string;
  fileName: string;
  file?: File; // dropped once done to free memory
  progress: number; // 0-100
  status: UploadStatus;
  error?: string;
}

interface UploadContextValue {
  tasks: UploadTask[];
  enqueue: (files: File[], event: { eventId: string; eventName: string }) => void;
  clearFinished: () => void;
  retry: (id: string) => void;
  activeCount: number;
}

const CONCURRENCY = 3;
// A signature is reusable for many files in the same folder within Cloudinary's
// 1h validity window; refresh a little early to be safe.
const SIG_TTL_MS = 50 * 60 * 1000;

const Ctx = createContext<UploadContextValue | null>(null);

export function useUploads(): UploadContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUploads must be used within UploadProvider");
  return ctx;
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  const tasksRef = useRef<UploadTask[]>([]);
  const activeRef = useRef(0);
  const sigRef = useRef<{ sig: UploadSignature; at: number } | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    userIdRef.current = session?.user?.id;
  }, [session?.user?.id]);
  // Lets a finished task re-drive the queue without pump referencing itself.
  const pumpRef = useRef<() => void>(() => {});

  const sync = () => setTasks([...tasksRef.current]);

  const update = useCallback((id: string, patch: Partial<UploadTask>) => {
    tasksRef.current = tasksRef.current.map((t) =>
      t.id === id ? { ...t, ...patch } : t,
    );
    sync();
  }, []);

  const getSig = useCallback(async (): Promise<UploadSignature> => {
    const now = Date.now();
    if (sigRef.current && now - sigRef.current.at < SIG_TTL_MS) {
      return sigRef.current.sig;
    }
    const sig = await getUploadSignature("uploads");
    sigRef.current = { sig, at: now };
    return sig;
  }, []);

  const pump = useCallback(() => {
    while (activeRef.current < CONCURRENCY) {
      const next = tasksRef.current.find((t) => t.status === "queued");
      if (!next) break;

      // Claim it synchronously so it isn't picked twice.
      tasksRef.current = tasksRef.current.map((t) =>
        t.id === next.id ? { ...t, status: "uploading" as UploadStatus } : t,
      );
      activeRef.current += 1;

      void (async (task: UploadTask) => {
        const uid = userIdRef.current;
        if (!uid) {
          update(task.id, { status: "error", error: "Not signed in" });
        } else if (!task.file) {
          update(task.id, { status: "error", error: "File unavailable" });
        } else {
          try {
            update(task.id, { progress: 0 });
            const sig = await getSig();
            const res = await uploadToCloudinary(task.file, sig, (pct) =>
              update(task.id, { progress: pct }),
            );
            await registerImage({
              creatorId: uid,
              eventId: task.eventId,
              publicId: res.public_id,
            });
            update(task.id, { status: "done", progress: 100, file: undefined });
          } catch (e) {
            update(task.id, {
              status: "error",
              error: e instanceof Error ? e.message : "Upload failed",
            });
          }
        }
        activeRef.current -= 1;
        pumpRef.current();
      })(next);
    }
    sync();
  }, [getSig, update]);

  useEffect(() => {
    pumpRef.current = pump;
  }, [pump]);

  const enqueue = useCallback(
    (files: File[], event: { eventId: string; eventName: string }) => {
      const newTasks: UploadTask[] = files.map((file) => ({
        id: genId(),
        eventId: event.eventId,
        eventName: event.eventName,
        fileName: file.name,
        file,
        progress: 0,
        status: "queued",
      }));
      tasksRef.current = [...tasksRef.current, ...newTasks];
      sync();
      pump();
    },
    [pump],
  );

  const clearFinished = useCallback(() => {
    tasksRef.current = tasksRef.current.filter(
      (t) => t.status === "queued" || t.status === "uploading",
    );
    sync();
  }, []);

  const retry = useCallback(
    (id: string) => {
      tasksRef.current = tasksRef.current.map((t) =>
        t.id === id && t.status === "error"
          ? { ...t, status: "queued", error: undefined, progress: 0 }
          : t,
      );
      sync();
      pump();
    },
    [pump],
  );

  const activeCount = tasks.filter(
    (t) => t.status === "queued" || t.status === "uploading",
  ).length;

  // Warn before leaving/closing the tab while uploads are in flight.
  useEffect(() => {
    if (activeCount === 0) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [activeCount]);

  return (
    <Ctx.Provider value={{ tasks, enqueue, clearFinished, retry, activeCount }}>
      {children}
      <UploadTray />
    </Ctx.Provider>
  );
}
