import { AdminsManager } from "@/components/admin/AdminsManager";
import { adminUsers } from "@/lib/admin-data";
import { requireOwnerPage } from "@/lib/auth";

export default async function AdminsPage() {
  const session = await requireOwnerPage();
  return <AdminsManager admins={await adminUsers()} me={session.username} />;
}
