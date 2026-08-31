"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/app/components/Header";
import { createEvent, type SimilarEvent } from "@/app/api/actions/event";
import { MapPin, Upload, AlertTriangle, Loader2 } from "lucide-react";

// Leaflet touches `window`, so load the picker client-only.
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-80 rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400">
      Loading map…
    </div>
  ),
});

const CATEGORIES = [
  "Running",
  "Cycling",
  "Triathlon",
  "Marathon",
  "Motorsports",
  "Other",
];

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [form, setForm] = useState({
    name: "",
    category: "",
    date: "",
    time: "",
    location: "",
    description: "",
    watermarkMode: "default" as "default" | "none",
    watermarkText: "",
  });
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [similar, setSimilar] = useState<SimilarEvent[] | null>(null);

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const onCover = (file: File | null) => {
    setCover(file);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  const isValid = form.name.trim() && form.category && form.date && form.location.trim();

  const buildDate = () =>
    form.time ? `${form.date}T${form.time}:00Z` : form.date;

  const submit = async (publish: boolean, force = false) => {
    if (!userId) {
      setError("You must be signed in.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const result = await createEvent({
        name: form.name.trim(),
        category: form.category,
        date: buildDate(),
        location: form.location.trim(),
        latitude: pin?.lat ?? null,
        longitude: pin?.lng ?? null,
        description: form.description.trim() || undefined,
        createdBy: userId,
        thumbnail: cover ?? undefined,
        publish,
        force,
        watermarkMode: form.watermarkMode,
        watermarkText:
          form.watermarkMode === "default" && form.watermarkText.trim()
            ? form.watermarkText.trim()
            : undefined,
      });

      if (result.status === "similar") {
        setSimilar(result.similarEvents);
        setBusy(false);
        return;
      }
      // Created — go manage it (add photos, view status).
      router.push("/creator/events");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create event");
      setBusy(false);
    }
  };

  return (
    <>
      <Header variant="solid" textVariant="dark" />
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-8 pt-24">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Create New Event
          </h1>
          <p className="text-gray-500 mb-6">
            Set up your event details, then add photos and publish.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Duplicate-event guard */}
          {similar && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 font-semibold mb-2">
                <AlertTriangle className="w-5 h-5" />
                Similar events already exist
              </div>
              <ul className="text-sm text-amber-900 list-disc pl-5 mb-3">
                {similar.map((s) => (
                  <li key={s.id}>
                    {s.name} — {new Date(s.date).toLocaleDateString()} (
                    {s.location})
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button
                  onClick={() => submit(false, true)}
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
                >
                  Create anyway
                </button>
                <button
                  onClick={() => setSimilar(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. KL Standard Chartered Marathon 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => set("time", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="e.g. Dataran Merdeka, Kuala Lumpur"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4" /> Pin location on map
                  <span className="text-gray-400 font-normal">
                    (click to drop a pin)
                  </span>
                </label>
                <MapPicker
                  value={pin}
                  onChange={(lat, lng) => setPin({ lat, lng })}
                />
                {pin && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pinned at {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}{" "}
                    <button
                      onClick={() => setPin(null)}
                      className="text-cyan-600 hover:underline ml-1"
                    >
                      clear
                    </button>
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Banner
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    {cover ? "Change image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onCover(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {coverPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverPreview}
                      alt="cover preview"
                      className="h-14 w-24 object-cover rounded-md border border-gray-200"
                    />
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview Watermark
                </label>
                <select
                  value={form.watermarkMode}
                  onChange={(e) =>
                    set("watermarkMode", e.target.value as "default" | "none")
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  <option value="default">Tiled text (your @handle)</option>
                  <option value="none">No watermark</option>
                </select>
              </div>

              {form.watermarkMode === "default" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Watermark text{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    value={form.watermarkText}
                    onChange={(e) => set("watermarkText", e.target.value)}
                    placeholder="Defaults to your @handle"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-2 border-t border-gray-200">
              <button
                onClick={() => submit(false)}
                disabled={!isValid || busy}
                className="px-6 py-2.5 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save as Draft"
                )}
              </button>
              <button
                onClick={() => submit(true)}
                disabled={!isValid || busy}
                className="px-6 py-2.5 rounded-lg font-semibold bg-cyan-400 text-black hover:bg-cyan-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {busy ? "Working…" : "Publish Event"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
