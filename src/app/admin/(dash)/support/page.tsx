import { BanksManager } from "@/components/admin/managers";
import { adminList } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export default async function SupportPage() {
  await requireAdminPage();
  return <BanksManager items={await adminList("bankAccounts")} />;
}
