"use client";

import { useState } from "react";
import { useUploads, type UploadTask } from "@/app/contexts/UploadContext";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCw,
  X,
} from "lucide-react";

export function UploadTray() {
  const { tasks, clearFinished, retry, activeCount } = useUploads();
  const [collapsed, setCollapsed] = useState(false);

  if (tasks.length === 0) return null;

  const done = tasks.filter((t) => t.status === "done").length;
  const errored = tasks.filter((t) => t.status === "error").length;
  const allFinished = activeCount === 0;

  // Group tasks by event for a tidy multi-event view.
  const groups = new Map<string, UploadTask[]>();
  for (const t of tasks) {
    const arr = groups.get(t.eventName) ?? [];
    arr.push(t);
    groups.set(t.eventName, arr);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {allFinished ? (
            errored > 0 ? (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            )
          ) : (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          )}
          {allFinished
            ? errored > 0
              ? `Done, ${errored} failed`
              : "Uploads complete"
            : `Uploading ${activeCount} item${activeCount === 1 ? "" : "s"}…`}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 rounded hover:bg-white/10"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {allFinished && (
            <button
              onClick={clearFinished}
              className="p-1 rounded hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary bar */}
      {!collapsed && (
        <div className="max-h-80 overflow-y-auto">
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
            {done}/{tasks.length} uploaded
          </div>

          {[...groups.entries()].map(([eventName, items]) => (
            <div key={eventName} className="border-b border-gray-100 last:border-0">
              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-700 truncate">
                {eventName}
              </div>
              <ul>
                {items.map((t) => (
                  <li
                    key={t.id}
                    className="px-4 py-1.5 flex items-center gap-2 text-xs"
                  >
                    <span className="shrink-0">
                      {t.status === "done" && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {t.status === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {t.status === "uploading" && (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                      )}
                      {t.status === "queued" && (
                        <span className="block w-4 h-4 rounded-full border-2 border-gray-300" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-gray-700">
                        {t.fileName}
                      </span>
                      {t.status === "uploading" && (
                        <span className="mt-0.5 block h-1 w-full rounded-full bg-gray-200">
                          <span
                            className="block h-1 rounded-full bg-cyan-400 transition-all"
                            style={{ width: `${t.progress}%` }}
                          />
                        </span>
                      )}
                      {t.status === "error" && (
                        <span className="block text-red-500 truncate">
                          {t.error ?? "Failed"}
                        </span>
                      )}
                    </span>
                    {t.status === "uploading" && (
                      <span className="shrink-0 tabular-nums text-gray-400">
                        {t.progress}%
                      </span>
                    )}
                    {t.status === "error" && (
                      <button
                        onClick={() => retry(t.id)}
                        className="shrink-0 p-1 rounded hover:bg-gray-100 text-gray-500"
                        aria-label="Retry"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
