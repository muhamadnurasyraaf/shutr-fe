"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Header } from "@/app/components/Header";
import {
  getMyEvents,
  updateEventStatus,
  getEventMetrics,
  formatRM,
  type CreatorEvent,
  type EventStatus,
  type EventMetrics,
} from "@/lib/creator-events";
import {
  Plus,
  Eye,
  Download,
  DollarSign,
  ImagePlus,
  BarChart3,
  Loader2,
  CalendarDays,
  MapPin,
} from "lucide-react";

const STATUS_STYLES: Record<EventStatus, string> = {
  DRAFT: "bg-gray-200 text-gray-700",
  PUBLISHED: "bg-green-100 text-green-700",
  UNLISTED: "bg-amber-100 text-amber-700",
  ARCHIVED: "bg-red-100 text-red-600",
};

// Allowed transitions from each status.
const TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["UNLISTED", "ARCHIVED"],
  UNLISTED: ["PUBLISHED", "ARCHIVED"],
  ARCHIVED: ["PUBLISHED"],
};

const TRANSITION_LABEL: Record<EventStatus, string> = {
  PUBLISHED: "Publish",
  UNLISTED: "Unlist",
  ARCHIVED: "Archive",
  DRAFT: "Draft",
};

export default function MyEventsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [events, setEvents] = useState<CreatorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Record<string, EventMetrics>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getMyEvents(userId);
      setEvents(res.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (id: string, status: EventStatus) => {
    if (!userId) return;
    setBusyId(id);
    try {
      await updateEventStatus(id, userId, status);
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setBusyId(null);
    }
  };

  const toggleMetrics = async (id: string) => {
    if (metrics[id]) {
      setMetrics((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    if (!userId) return;
    try {
      const m = await getEventMetrics(id, userId);
      setMetrics((prev) => ({ ...prev, [id]: m }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load metrics");
    }
  };

  return (
    <>
      <Header variant="solid" textVariant="dark" />
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-8 pt-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Events</h1>
              <p className="text-gray-500">
                Manage your events, photos, and status.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/creator/wallet"
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50"
              >
                Wallet
              </Link>
              <Link
                href="/creator/events/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-500"
              >
                <Plus className="w-4 h-4" /> Create New Event
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
              No events yet.{" "}
              <Link
                href="/creator/events/new"
                className="text-cyan-600 font-semibold hover:underline"
              >
                Create your first event
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((e) => (
                <div
                  key={e.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* thumbnail */}
                    <div className="w-full sm:w-28 h-20 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                      {e.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={e.thumbnailUrl}
                          alt={e.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImagePlus className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {e.name}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[e.status]}`}
                        >
                          {e.status}
                        </span>
                        {e.category && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {e.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(e.date).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5" />
                          {e.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ImagePlus className="w-3.5 h-3.5" />
                          {e._count?.images ?? 0} photos
                        </span>
                      </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/creator/upload?eventId=${e.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-50"
                      >
                        <ImagePlus className="w-3.5 h-3.5" /> Add photos
                      </Link>
                      <button
                        onClick={() => toggleMetrics(e.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-50"
                      >
                        <BarChart3 className="w-3.5 h-3.5" /> Metrics
                      </button>
                      {TRANSITIONS[e.status].map((target) => (
                        <button
                          key={target}
                          onClick={() => changeStatus(e.id, target)}
                          disabled={busyId === e.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 ${
                            target === "PUBLISHED"
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : target === "ARCHIVED"
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-amber-500 text-white hover:bg-amber-600"
                          }`}
                        >
                          {TRANSITION_LABEL[target]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* metrics drawer */}
                  {metrics[e.id] && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Metric
                        icon={<Eye className="w-4 h-4" />}
                        label="Views"
                        value={String(metrics[e.id].views)}
                      />
                      <Metric
                        icon={<Download className="w-4 h-4" />}
                        label="Downloads"
                        value={String(metrics[e.id].downloads)}
                      />
                      <Metric
                        icon={<DollarSign className="w-4 h-4" />}
                        label="Revenue"
                        value={formatRM(metrics[e.id].revenue)}
                      />
                      <Metric
                        icon={<DollarSign className="w-4 h-4" />}
                        label={`Net (after ${Math.round(metrics[e.id].commissionRate * 100)}%)`}
                        value={formatRM(metrics[e.id].netRevenue)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
    </div>
  );
}
