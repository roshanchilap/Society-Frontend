import { useEffect } from "react";
import { useOwnerStore } from "../../store/useOwnerStore";
import { useAuthStore } from "../../auth/useAuthStore";

import AnnouncementWidget from "./widgets/AnnouncementWidget";
import MaintenanceDueWidget from "./widgets/MaintenanceDueWidget";
import RecentPaymentsWidget from "./widgets/RecentPaymentsWidget";
import SocietyInfoWidget from "./widgets/SocietyInfoWidget";

export default function OwnerDashboard() {
  const role = useAuthStore((s) => s.role);

  const loadMyMaintenance = useOwnerStore((s) => s.loadMyMaintenance);
  const loadMySlips = useOwnerStore((s) => s.loadMySlips);
  const loadMyNotices = useOwnerStore((s) => s.loadMyNotices);

  useEffect(() => {
    if (role === "owner") {
      loadMyMaintenance();
      loadMySlips();
      loadMyNotices();
    }
  }, [role]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MaintenanceDueWidget />
        <AnnouncementWidget />
        <RecentPaymentsWidget />
        <SocietyInfoWidget />
      </div>
    </div>
  );
}
