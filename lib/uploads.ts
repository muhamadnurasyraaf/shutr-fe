// Client-side helpers for direct browser→Cloudinary uploads.
//
// Flow: get a short-lived signature from our backend → upload the file straight
// to Cloudinary (XHR, so we get real per-byte progress) → register the resulting
// public_id with our backend, which enqueues background processing.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";

export interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface RegisteredImage {
  id: string;
  publicId: string;
  url: string;
  eventId: string | null;
  processingStatus: string;
}

// Fetch a signature for a signed direct upload. One signature is valid ~1h and
// can be reused for many files in the same folder (Cloudinary validates the
// timestamp, not the file), so callers fetch it once per batch.
export async function getUploadSignature(
  folder?: string,
): Promise<UploadSignature> {
  const res = await fetch(`${API_BASE_URL}/creator/upload/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: folder ?? "" }),
  });
  if (!res.ok) throw new Error(`Failed to get upload signature (${res.status})`);
  return res.json();
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
}

// Upload a single file directly to Cloudinary with progress callbacks. Returns
// the created public_id. Uses XHR because fetch() can't report upload progress.
export function uploadToCloudinary(
  file: File,
  signed: UploadSignature,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signed.apiKey);
    form.append("timestamp", String(signed.timestamp));
    form.append("signature", signed.signature);
    form.append("folder", signed.folder);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ public_id: data.public_id, secure_url: data.secure_url });
        } catch {
          reject(new Error("Invalid Cloudinary response"));
        }
      } else {
        reject(new Error(`Cloudinary upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(form);
  });
}

// Register an uploaded image with our backend (persists the row + enqueues
// background bib/plate + face-embedding processing).
export async function registerImage(payload: {
  creatorId: string;
  eventId?: string;
  description?: string;
  publicId: string;
}): Promise<RegisteredImage> {
  const res = await fetch(`${API_BASE_URL}/creator/register-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to register image (${res.status})`);
  return res.json();
}
