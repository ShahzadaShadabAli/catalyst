"use client";
import Image, { type ImageLoaderProps } from "next/image";
import type { ImageRef } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Placeholder } from "./Placeholder";

/** Cloudinary does resizing and format conversion on its CDN. */
function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  return src.replace("/upload/", `/upload/f_auto,q_${quality ?? "auto"},w_${width},c_limit/`);
}

type Props = {
  image?: ImageRef | null;
  sizes: string;
  className?: string;
  fallbackLabel?: string;
  priority?: boolean;
  alt?: string;
};

/** Fills its (relatively positioned) parent. Falls back to an illustrated placeholder. */
export function Photo({ image, sizes, className, fallbackLabel, priority, alt }: Props) {
  if (!image?.url) return <Placeholder label={fallbackLabel} className={className} />;
  const isCloudinary = image.url.startsWith("https://res.cloudinary.com/");
  return (
    <Image
      src={image.url}
      alt={alt ?? image.alt ?? ""}
      fill
      sizes={sizes}
      priority={priority}
      loader={isCloudinary ? cloudinaryLoader : undefined}
      className={cn("object-cover", className)}
    />
  );
}
