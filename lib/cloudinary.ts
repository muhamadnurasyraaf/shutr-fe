export type CloudinarySize = "thumbnail" | "standard" | "high";

const TRANSFORM_MAP: Record<CloudinarySize, string> = {
  thumbnail: "c_fill,w_300,h_300", // small square
  standard: "c_limit,w_1200", // normal display size
  high: "", // original, no transform
};

/**
 * Add size transforms to a Cloudinary URL.
 * Works with public URLs (/image/upload/).
 */
export function getCloudinaryUrl(
  originalUrl: string,
  size: CloudinarySize,
): string {
  try {
    const transform = TRANSFORM_MAP[size];

    // High quality: return original as-is
    if (transform === "") {
      return originalUrl;
    }

    // Regular upload URLs: /image/upload/
    const uploadIndex = originalUrl.indexOf("/upload/");
    if (uploadIndex === -1) return originalUrl; // not a valid Cloudinary URL

    // Insert transformation after `/upload/`
    const before = originalUrl.substring(0, uploadIndex + 8); // "/upload/" is 8 chars
    const after = originalUrl.substring(uploadIndex + 8);

    // Check if transforms already exist (f_auto, q_auto, etc.)
    // If so, prepend our size transform
    if (after.match(/^[a-z]_[^/]+/)) {
      const slashIndex = after.indexOf("/");
      if (slashIndex !== -1) {
        const existingTransforms = after.substring(0, slashIndex);
        const rest = after.substring(slashIndex);
        return `${before}${transform},${existingTransforms}${rest}`;
      }
    }

    return `${before}${transform}/${after}`;
  } catch {
    return originalUrl;
  }
}
