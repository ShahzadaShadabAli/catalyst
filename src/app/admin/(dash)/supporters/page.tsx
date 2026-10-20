import { SupportersManager } from "@/components/admin/managers";
import { adminList } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export default async function SupportersPage() {
  await requireAdminPage();
  return <SupportersManager items={await adminList("supporters")} />;
}
