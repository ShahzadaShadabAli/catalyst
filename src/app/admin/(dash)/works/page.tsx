import { EventsManager } from "@/components/admin/managers";
import { adminList } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/auth";

export default async function WorksPage() {
  await requireAdminPage();
  const events = (await adminList("events")).sort((a, b) => b.date.localeCompare(a.date));
  return <EventsManager items={events} />;
}
