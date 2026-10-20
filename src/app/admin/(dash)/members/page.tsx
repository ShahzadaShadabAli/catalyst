import { MembersManager } from "@/components/admin/managers";
import { adminList } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export default async function MembersPage() {
  await requireAdminPage();
  return <MembersManager items={await adminList("members")} />;
}
