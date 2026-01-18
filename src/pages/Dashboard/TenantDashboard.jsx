import AnnouncementWidget from "./widgets/AnnouncementWidget";
import MaintenanceDueWidget from "./widgets/MaintenanceDueWidget";

export default function TenantDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Tenant Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MaintenanceDueWidget />
        <AnnouncementWidget />
      </div>
    </div>
  );
}
