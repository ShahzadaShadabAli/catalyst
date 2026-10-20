import { LeadersManager } from "@/components/admin/managers";
import { adminList } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export default async function LeadershipPage() {
  await requireAdminPage();
  return <LeadersManager items={await adminList("leaders")} />;
}
