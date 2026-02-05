import {
  Home,
  Building,
  Users,
  Bell,
  Wrench,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/useAuthStore";
import { useEffect } from "react";

export default function Sidebar({ onClose }) {
  const { token, logout, role } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

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

  // Auto-close on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 768) {
      onClose?.();
    }
  }, [location.pathname]);

  const handleClose = () => {
    if (window.innerWidth < 768) {
      onClose?.();
    }
  };

  return (
    <aside
      className="
        w-64
        min-h-screen
        bg-white
        shadow-lg
        flex flex-col
      "
    >
      {/* 🔼 Scrollable menu */}
      <div className="flex-1 overflow-y-auto px-6 pt-6">
        <h2
          className="
            text-xl font-bold mb-8 tracking-tight text-gray-800
            pl-3 border-l-4 border-blue-600
          "
        >
          Society Panel
        </h2>

        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleClose}
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
      </div>

      {/* 🔽 Logout ALWAYS visible */}
    {token && (
      <div className="px-4 pt-4 pb-14 md:pb-4">
        <button
          onClick={() => {
            logout();
            navigate("/login");
            handleClose();
          }}
          className="
            flex items-center gap-3 w-full
            px-4 py-2 text-sm
            text-red-600
            rounded-lg
            bg-red-100 hover:bg-red-200
          "
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    )}

    </aside>
  );
}
