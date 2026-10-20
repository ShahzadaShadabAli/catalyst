import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/request";

export const dynamic = "force-dynamic";

const ALLOWED_FORMATS = "jpg,jpeg,png,webp,avif,gif";

/**
 * Signs a one-off direct upload to Cloudinary for a logged-in admin.
 * The browser uploads straight to Cloudinary; our API secret never leaves the server.
 * The signature locks the folder and file formats, and expires after one hour (Cloudinary's rule).
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Image uploads aren't set up yet (Cloudinary keys missing)." }, { status: 503 });
  }

  const folder = process.env.CLOUDINARY_FOLDER || "catalyst-collective";
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = { allowed_formats: ALLOWED_FORMATS, folder, timestamp };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = createHash("sha1").update(toSign + apiSecret).digest("hex");

  return NextResponse.json(
    { cloudName, apiKey, timestamp, folder, signature, allowedFormats: ALLOWED_FORMATS },
    { headers: { "Cache-Control": "no-store" } },
  );
}
