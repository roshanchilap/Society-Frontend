import { useAuthStore } from "../../auth/useAuthStore";
import AdminDashboard from "./AdminDashboard";
import OwnerDashboard from "./OwnerDashboard";
import TenantDashboard from "./TenantDashboard";

export default function Dashboard() {
  const { role } = useAuthStore();

  if (role === "admin") return <AdminDashboard />;
  if (role === "owner") return <OwnerDashboard />;
  if (role === "tenant") return <TenantDashboard />;

  return <p>Unauthorized</p>;
}
