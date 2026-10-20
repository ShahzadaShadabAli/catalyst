import { NextResponse } from "next/server";
import { adminApplications } from "@/lib/admin-data";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "createdAt",
  "status",
  "type",
  "fullName",
  "dob",
  "education",
  "institution",
  "city",
  "email",
  "phone",
  "expertise",
  "reason",
] as const;

/** Quote a CSV cell and defuse spreadsheet formulas (=, +, -, @ at the start). */
function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = new URL(req.url).searchParams.get("status");
  const rows = (await adminApplications()).filter((a) => !status || status === "all" || a.status === status);
  const csv = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(String(r[c] ?? ""))).join(","))].join("\r\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="catalyst-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
