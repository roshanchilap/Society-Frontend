import { PlusCircle, Bell, FileText, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickActions() {
  const actions = [
    { label: "Add Flat", icon: Home, to: "/flats" },
    { label: "Create Announcement", icon: Bell, to: "/announcements" },
    { label: "Generate Maintenance", icon: FileText, to: "/maintenance" },
    { label: "Add User", icon: PlusCircle, to: "/users" },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-4 text-blue-700">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              to={a.to}
              className="group border rounded-lg p-4 flex flex-col items-center justify-center 
                         bg-blue-50 border-blue-100 hover:bg-blue-100 transition shadow-sm"
            >
              <div
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center 
                           shadow mb-2 group-hover:scale-110 transition"
              >
                <Icon size={20} className="text-blue-600" />
              </div>

              <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 text-center">
                {a.label}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
