export type CloudinarySize = "thumbnail" | "standard" | "high";

const TRANSFORM_MAP: Record<CloudinarySize, string> = {
  thumbnail: "c_fill,w_300,h_300", // small square
  standard: "c_fill,w_1200", // normal display size
  high: "", // original, no transform
};

export function getCloudinaryUrl(
  originalUrl: string,
  size: CloudinarySize
): string {
  try {
    const transform = TRANSFORM_MAP[size];

    // Cloudinary URLs always have "/image/upload/" before transformations
    const uploadIndex = originalUrl.indexOf("/upload/");

    if (uploadIndex === -1) return originalUrl; // not a valid Cloudinary URL

    if (transform === "") {
      // high quality: return original as-is
      return originalUrl;
    }

    // Insert transformation after `/upload/`
    const before = originalUrl.substring(0, uploadIndex + 8); // "/upload/" is 8 chars
    const after = originalUrl.substring(uploadIndex + 8);

    return `${before}${transform}/${after}`;
  } catch {
    return originalUrl;
  }
}
