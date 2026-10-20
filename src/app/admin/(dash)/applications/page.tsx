import { ApplicationsManager } from "@/components/admin/ApplicationsManager";
import { adminApplications } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export default async function ApplicationsPage() {
  await requireAdminPage();
  return <ApplicationsManager items={await adminApplications()} />;
}
