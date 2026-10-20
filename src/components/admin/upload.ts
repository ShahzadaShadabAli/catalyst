"use client";
import type { ImageRef } from "@/lib/schemas";

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export const uploadsEnabled = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

/** Signed direct upload: our server signs, the browser sends the file straight to Cloudinary. */
export async function uploadImage(file: File): Promise<ImageRef> {
  if (!TYPES.includes(file.type)) throw new Error("Use a JPG, PNG, WebP, AVIF or GIF image.");
  if (file.size > MAX_BYTES) throw new Error("That image is over 10 MB. Please use a smaller one.");

  const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
  const sign = await signRes.json().catch(() => ({}));
  if (!signRes.ok) throw new Error(sign.error ?? "Couldn't start the upload.");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);
  form.append("allowed_formats", sign.allowedFormats);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(sign.cloudName)}/image/upload`, {
    method: "POST",
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || typeof json.secure_url !== "string") {
    throw new Error(json.error?.message ?? "Upload failed. Please try again.");
  }
  return { url: json.secure_url, publicId: json.public_id, alt: "" };
}
