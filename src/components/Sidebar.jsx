import {
  Home,
  Building,
  Users,
  Bell,
  Wrench,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../auth/useAuthStore";

export default function Sidebar() {
  const { token, logout, role } = useAuthStore();

  const adminMenu = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Flats", icon: Building, path: "/flats" },
    { name: "Maintenance", icon: Wrench, path: "/maintenance" },
    { name: "Users", icon: Users, path: "/users" },
    { name: "Announcements", icon: Bell, path: "/announcements" },
    { name: "Complaints", icon: MessageSquare, path: "/complaints" },
  ];

  const memberMenu = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "My Maintenance", icon: Wrench, path: "/my-maintenance" },
    { name: "Announcements", icon: Bell, path: "/announcements" },
    { name: "Complaints", icon: MessageSquare, path: "/complaints" },
  ];

  const menu = role === "admin" ? adminMenu : memberMenu;

  return (
    <aside
      className="
        w-64 h-screen
        bg-white
        shadow-lg
        p-6
        flex flex-col
        fixed md:static
        z-40
      "
    >
      <h2
        className="text-xl font-bold mb-8 tracking-tight text-gray-800 
                   pl-3 border-l-4 border-blue-600"
      >
        Society Panel
      </h2>

      <nav className="space-y-2 flex-1">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg
                 text-sm font-medium transition-all
                 ${
                   isActive
                     ? "bg-blue-600 text-white shadow-md"
                     : "text-gray-700 hover:bg-gray-100"
                 }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {token && (
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 mt-4 text-sm
                     text-red-600 rounded-lg bg-red-100 hover:bg-red-200"
        >
          <LogOut size={18} /> Logout
        </button>
      )}
    </aside>
  );
}
