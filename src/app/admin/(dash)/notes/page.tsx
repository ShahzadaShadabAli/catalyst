import { NotesManager } from "@/components/admin/managers";
import { adminList } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export default async function NotesPage() {
  await requireAdminPage();
  return <NotesManager items={await adminList("notes")} />;
}
