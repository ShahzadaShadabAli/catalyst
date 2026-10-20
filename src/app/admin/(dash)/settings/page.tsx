import { SettingsForm } from "@/components/admin/SettingsForm";
import { adminSite } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export default async function SettingsPage() {
  await requireAdminPage();
  return <SettingsForm site={await adminSite()} />;
}
