import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { ToastProvider } from "@/components/admin/ui";
import { adminCounts } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  const counts = await adminCounts();
  return (
    <ToastProvider>
      <div className="min-h-dvh bg-paper">
        <AdminNav username={session.username} newApps={counts.newApps} />
        <main className="px-5 py-8 sm:px-8 lg:ml-64 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
