import { Bell, Info, AlertTriangle, Calendar } from "lucide-react";
import { useAuthStore } from "../../../auth/useAuthStore";
import { useSocietyStore } from "../../../store/useAdminStore"; // admin store
import { useOwnerStore } from "../../../store/useOwnerStore"; // owner store

export default function NoticeWidget() {
  const role = useAuthStore((s) => s.role);

  // Admin sees REGISTRY
  const adminRegistry = useSocietyStore((s) => s.notices);

  // Owner sees personal notices
  const ownerNotices = useOwnerStore((s) => s.notices);

  // Pick correct data
  const items = role === "admin" ? adminRegistry || [] : ownerNotices || [];

  const latest = [...items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // ICONS
  const getIcon = (type) => {
    const cls = "w-4 h-4";
    switch (type) {
      case "maintenance":
        return <Info className={`${cls} text-blue-600`} />;
      case "meeting":
        return <Bell className={`${cls} text-green-600`} />;
      case "event":
        return <Bell className={`${cls} text-purple-600`} />;
      default:
        return <AlertTriangle className={`${cls} text-amber-600`} />;
    }
  };

  // BADGE COLORS
  const getBadge = (type) => {
    const base = "px-2 py-0.5 text-[10px] rounded-full uppercase border";
    switch (type) {
      case "maintenance":
        return `${base} bg-blue-50 text-blue-700 border-blue-200`;
      case "meeting":
        return `${base} bg-green-50 text-green-700 border-green-200`;
      case "event":
        return `${base} bg-purple-50 text-purple-700 border-purple-200`;
      default:
        return `${base} bg-amber-50 text-amber-700 border-amber-200`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
        <Bell size={18} /> Latest Notices
      </h3>

      {latest.length === 0 && (
        <p className="text-gray-500 text-sm">No notices yet</p>
      )}

      <ul className="space-y-3">
        {latest.map((n) => (
          <li
            key={n._id}
            className="
              p-3 rounded-lg border border-gray-200 bg-gray-50 
              hover:bg-gray-100 transition flex flex-col gap-1 cursor-pointer
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {getIcon(n.type)}
                <p className="font-medium text-gray-800 truncate">{n.title}</p>
              </div>

              <span className={getBadge(n.type)}>{n.type}</span>
            </div>

            {/* Message */}
            <p className="text-gray-600 text-sm line-clamp-2">{n.message}</p>

            {/* Date */}
            <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Calendar size={12} />
              {new Date(n.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
