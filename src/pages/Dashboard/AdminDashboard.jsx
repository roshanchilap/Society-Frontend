import StatCard from "./widgets/StatCard";
import AnnouncementWidget from "./widgets/AnnouncementWidget";
import MaintenanceDueWidget from "./widgets/MaintenanceDueWidget";
import RecentPaymentsWidget from "./widgets/RecentPaymentsWidget";
import OccupancyChart from "./widgets/OccupancyChart";
import QuickActions from "./widgets/QuickActions";

import { Home, Users, UserCheck, AlertTriangle } from "lucide-react";
import { useSocietyStore } from "../../store/useAdminStore";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const flats = useSocietyStore((s) => s.flats);
  const users = useSocietyStore((s) => s.users);
  const maintenance = useSocietyStore((s) => s.maintenance);

  const navigate = useNavigate();

  const totalFlats = flats.length;
  const owners = users.filter((u) => u.role === "owner").length;
  const tenants = users.filter((u) => u.role === "tenant").length;
  const pendingMaintenance = maintenance.filter(
    (m) => m.status !== "paid"
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <StatCard
          label="Total Flats"
          value={totalFlats}
          Icon={Home}
          bg="bg-blue-50"
          iconBg="bg-blue-100"
          onClick={() => navigate("/flats")}
        />
        <StatCard
          label="Owners"
          value={owners}
          Icon={UserCheck}
          bg="bg-green-50"
          iconBg="bg-green-100"
          onClick={() => navigate("/flats")}
        />
        <StatCard
          label="Tenants"
          value={tenants}
          Icon={Users}
          bg="bg-purple-50"
          iconBg="bg-purple-100"
          onClick={() => navigate("/flats")}
        />
        <StatCard
          label="Pending Maintenance"
          value={pendingMaintenance}
          Icon={AlertTriangle}
          bg="bg-red-50"
          iconBg="bg-red-100"
          onClick={() => navigate("/maintenance")}
        />
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <MaintenanceDueWidget />
        <AnnouncementWidget />
        <RecentPaymentsWidget />
      </div>

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <OccupancyChart owners={owners} tenants={tenants} />
        <QuickActions />
      </div>
    </div>
  );
}
