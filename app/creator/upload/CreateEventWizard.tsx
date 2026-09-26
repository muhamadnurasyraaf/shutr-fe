"use client";

import { useState, useRef, type DragEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  createEvent,
  type SimilarEvent,
  type PricingTierInput,
  type BundleRuleInput,
} from "@/app/api/actions/event";
import { updateEventStatus } from "@/lib/creator-events";
import { useUploads } from "@/app/contexts/UploadContext";
import {
  MapPin,
  Upload,
  AlertTriangle,
  Loader2,
  Check,
  X,
  Tag,
  Images,
  ClipboardList,
} from "lucide-react";

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

const STEPS = [
  { title: "Details & Location", icon: ClipboardList },
  { title: "Pricing & Packages", icon: Tag },
  { title: "Batch Upload", icon: Images },
];

interface HeldImage {
  id: string;
  imageId: string;
  file: File;
  preview: string;
}

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent";

// Local (not UTC) YYYY-MM-DD for the date input's default value.
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

interface CreateEventWizardProps {
  // Return to the event picker without creating anything.
  onCancel: () => void;
}

export default function CreateEventWizard({ onCancel }: CreateEventWizardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { enqueue } = useUploads();

  const [step, setStep] = useState(0);

  // ---- Step 1: details & location ----
  const [form, setForm] = useState({
    name: "",
    category: "",
    date: todayISO(),
    time: "",
    location: "",
    description: "",
    watermarkMode: "default" as "default" | "none",
    watermarkText: "",
  });
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // ---- Step 2: pricing & packages ----
  const [pricing, setPricing] = useState({
    webEnabled: true,
    webLabel: "Web / Standard",
    webPrice: "15",
    webResolution: "2048",
    origEnabled: true,
    origLabel: "Original High-Res",
    origPrice: "25",
    bundleEnabled: false,
    bundleMinPhotos: "5",
    bundlePrice: "60",
  });

  // ---- Step 3: photos ----
  const [images, setImages] = useState<HeldImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [similar, setSimilar] = useState<SimilarEvent[] | null>(null);

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));
  const setPrice = (k: keyof typeof pricing, v: string | boolean) =>
    setPricing((p) => ({ ...p, [k]: v }));

  const onCover = (file: File | null) => {
    setCover(file);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  const buildDate = () =>
    form.time ? `${form.date}T${form.time}:00Z` : form.date;

  // ---- validation per step ----
  const step1Valid =
    !!form.name.trim() &&
    !!form.category &&
    !!form.date &&
    !!form.location.trim();
  const atLeastOneTier =
    (pricing.webEnabled && Number(pricing.webPrice) > 0) ||
    (pricing.origEnabled && Number(pricing.origPrice) > 0);
  const bundleValid =
    !pricing.bundleEnabled ||
    (Number(pricing.bundleMinPhotos) > 0 && Number(pricing.bundlePrice) > 0);
  const step2Valid = atLeastOneTier && bundleValid;

  // ---- image handling (Step 3) ----
  const generateImageId = (counter: number): string => {
    const initials = form.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
    const d = form.date ? new Date(form.date) : new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    return `${initials || "EVT"}${dateStr}-${String(counter).padStart(3, "0")}`;
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setImages((prev) => {
      let counter = prev.length + 1;
      const next = Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .map((file) => ({
          id: Math.random().toString(36).substring(2),
          imageId: generateImageId(counter++),
          file,
          preview: URL.createObjectURL(file),
        }));
      return [...prev, ...next];
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ---- pricing payload ----
  const buildPricingTiers = (): PricingTierInput[] => {
    const tiers: PricingTierInput[] = [];
    if (pricing.webEnabled && Number(pricing.webPrice) > 0) {
      tiers.push({
        tier: "WEB",
        label: pricing.webLabel.trim() || "Web / Standard",
        price: Number(pricing.webPrice),
        maxResolution: pricing.webResolution
          ? Number(pricing.webResolution)
          : null,
      });
    }
    if (pricing.origEnabled && Number(pricing.origPrice) > 0) {
      tiers.push({
        tier: "ORIGINAL",
        label: pricing.origLabel.trim() || "Original High-Res",
        price: Number(pricing.origPrice),
      });
    }
    return tiers;
  };

  const buildBundleRules = (): BundleRuleInput[] =>
    pricing.bundleEnabled &&
    Number(pricing.bundleMinPhotos) > 0 &&
    Number(pricing.bundlePrice) > 0
      ? [
          {
            minPhotos: Number(pricing.bundleMinPhotos),
            price: Number(pricing.bundlePrice),
          },
        ]
      : [];

  // ---- final submit: create event + upload photos + set status ----
  const finish = async (publish: boolean, force = false) => {
    if (!userId) {
      setError("You must be signed in.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      // 1) Create the event (as draft first; we publish after photos land).
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
        publish: false,
        force,
        watermarkMode: form.watermarkMode,
        watermarkText:
          form.watermarkMode === "default" && form.watermarkText.trim()
            ? form.watermarkText.trim()
            : undefined,
        pricingTiers: buildPricingTiers(),
        bundleRules: buildBundleRules(),
      });

      if (result.status === "similar") {
        setSimilar(result.similarEvents);
        setBusy(false);
        return;
      }

      const eventId = result.event.id;

      // 2) Publish now, or leave as draft.
      if (publish) {
        await updateEventStatus(eventId, userId, "PUBLISHED");
      }

      // 3) Hand the held photos to the background upload manager and leave.
      // They upload with progress in the tray while the photographer moves on
      // (e.g. to set up another event).
      if (images.length > 0) {
        enqueue(
          images.map((img) => img.file),
          { eventId, eventName: form.name.trim() },
        );
        images.forEach((img) => URL.revokeObjectURL(img.preview));
      }

      router.push(`/creator/contents?event=${eventId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create event");
      setBusy(false);
    }
  };

  const goNext = () => {
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => {
    setError(null);
    if (step === 0) {
      onCancel();
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
      <p className="text-gray-500 mb-6">
        Set up details, pricing, and photos, then publish.
      </p>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <div
              key={s.title}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                    done
                      ? "bg-cyan-400 border-cyan-400 text-black"
                      : active
                        ? "border-cyan-400 text-cyan-600 bg-white"
                        : "border-gray-300 text-gray-400 bg-white"
                  }`}
                >
                  {done ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    active
                      ? "text-gray-900"
                      : done
                        ? "text-gray-600"
                        : "text-gray-400"
                  }`}
                >
                  Step {i + 1}: {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-3 ${done ? "bg-cyan-400" : "bg-gray-300"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Duplicate-event guard (surfaces on final submit) */}
      {similar && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Similar events already exist
          </div>
          <ul className="text-sm text-amber-900 list-disc pl-5 mb-3">
            {similar.map((s) => (
              <li key={s.id}>
                {s.name} — {new Date(s.date).toLocaleDateString()} ({s.location})
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              onClick={() => finish(false, true)}
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* ================= STEP 1 ================= */}
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. KL Standard Chartered Marathon 2026"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              Set the download prices buyers pay for photos in this event.
            </p>

            {/* Tier 1: Web / Standard */}
            <PricingTierCard
              title="Tier 1 — Web / Standard"
              hint="Lower-resolution download for social media."
              enabled={pricing.webEnabled}
              onToggle={(v) => setPrice("webEnabled", v)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Label">
                  <input
                    value={pricing.webLabel}
                    onChange={(e) => setPrice("webLabel", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Price (RM)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.webPrice}
                    onChange={(e) => setPrice("webPrice", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Max resolution (px)">
                  <input
                    type="number"
                    min="0"
                    value={pricing.webResolution}
                    onChange={(e) => setPrice("webResolution", e.target.value)}
                    placeholder="e.g. 2048"
                    className={inputClass}
                  />
                </Field>
              </div>
            </PricingTierCard>

            {/* Tier 2: Original High-Res */}
            <PricingTierCard
              title="Tier 2 — Original High-Res"
              hint="Full-size, print-ready original file."
              enabled={pricing.origEnabled}
              onToggle={(v) => setPrice("origEnabled", v)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Label">
                  <input
                    value={pricing.origLabel}
                    onChange={(e) => setPrice("origLabel", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Price (RM)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.origPrice}
                    onChange={(e) => setPrice("origPrice", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </PricingTierCard>

            {/* Bundle rule */}
            <PricingTierCard
              title="Bundle Deal"
              hint="Reward buyers who purchase multiple photos."
              enabled={pricing.bundleEnabled}
              onToggle={(v) => setPrice("bundleEnabled", v)}
            >
              <div className="flex flex-wrap items-end gap-3 text-sm">
                <span className="text-gray-600 pb-2">Buy at least</span>
                <div className="w-24">
                  <input
                    type="number"
                    min="2"
                    value={pricing.bundleMinPhotos}
                    onChange={(e) => setPrice("bundleMinPhotos", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <span className="text-gray-600 pb-2">photos for RM</span>
                <div className="w-28">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.bundlePrice}
                    onChange={(e) => setPrice("bundlePrice", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </PricingTierCard>

            {!atLeastOneTier && (
              <p className="text-sm text-amber-600">
                Enable at least one pricing tier with a price above 0.
              </p>
            )}

            {/* Watermark config */}
            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Preview Watermark
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Watermark mode">
                  <select
                    value={form.watermarkMode}
                    onChange={(e) =>
                      set("watermarkMode", e.target.value as "default" | "none")
                    }
                    className={inputClass}
                  >
                    <option value="default">Tiled text (your @handle)</option>
                    <option value="none">No watermark</option>
                  </select>
                </Field>
                {form.watermarkMode === "default" && (
                  <Field label="Watermark text (optional)">
                    <input
                      value={form.watermarkText}
                      onChange={(e) => set("watermarkText", e.target.value)}
                      placeholder="Defaults to your @handle"
                      className={inputClass}
                    />
                  </Field>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 2 && (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">
              Drag &amp; drop the full album. Watermarked previews are generated
              automatically; originals are stored securely.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg text-center transition-all ${
                images.length > 0 ? "p-4" : "p-10"
              } ${
                isDragging
                  ? "border-cyan-400 bg-cyan-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {images.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-cyan-400 text-black text-xs font-bold">
                      {images.length}
                    </span>
                    {images.length === 1 ? "photo added" : "photos added"}
                  </span>
                  <span className="text-sm text-gray-500">— drop more or</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                  >
                    Add more
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-3 w-10 h-10 text-gray-400" />
                  <p className="mb-1 font-medium text-gray-700">
                    Drag &amp; drop images here
                  </p>
                  <p className="mb-4 text-sm text-gray-500">
                    or click below to select files
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                  >
                    Select Images
                  </button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {images.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  {images.length} {images.length === 1 ? "photo" : "photos"}{" "}
                  ready
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="relative group rounded-lg overflow-hidden border bg-white"
                    >
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 right-1.5 z-10 flex w-6 h-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        aria-label="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="aspect-square overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.preview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-1.5 bg-gray-50 border-t">
                        <p
                          className="text-[10px] font-mono text-gray-500 truncate"
                          title={img.imageId}
                        >
                          {img.imageId}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && (
              <p className="text-sm text-gray-400">
                You can also publish now and add photos later.
              </p>
            )}

            {images.length > 0 && (
              <p className="text-xs text-gray-400">
                Photos upload in the background after you finish — you can leave
                this page and track progress in the upload tray.
              </p>
            )}
          </div>
        )}

        {/* ================= NAV / ACTIONS ================= */}
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={goBack}
            disabled={busy}
            className="px-5 py-2.5 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              disabled={
                (step === 0 && !step1Valid) || (step === 1 && !step2Valid)
              }
              className="px-6 py-2.5 rounded-lg font-semibold bg-cyan-400 text-black hover:bg-cyan-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => finish(false)}
                disabled={busy}
                className="px-6 py-2.5 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save as Draft"
                )}
              </button>
              <button
                onClick={() => finish(true)}
                disabled={busy}
                className="px-6 py-2.5 rounded-lg font-semibold bg-cyan-400 text-black hover:bg-cyan-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {busy ? "Working…" : "Publish Event"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function PricingTierCard({
  title,
  hint,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  hint: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        enabled ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500">{hint}</p>
        </div>
        <label className="inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-cyan-400 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
        </label>
      </div>
      {enabled && children}
    </div>
  );
}
