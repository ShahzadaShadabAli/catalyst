import { UpcomingManager } from "@/components/admin/managers";
import { adminList } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";
import { pkToday } from "@/lib/schemas";

export default async function UpcomingPage() {
  await requireAdminPage();
  return <UpcomingManager items={await adminList("upcoming")} today={pkToday()} />;
}
