import {
  AlertCircle,
  ShieldAlert,
  Wrench,
  Calendar,
  Edit,
  Trash,
} from "lucide-react";
import { useAuthStore } from "../../auth/useAuthStore";

export default function ComplaintCard({ item, onOpen, onEdit, onDelete }) {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const userId = user?._id?.toString();

  /* -----------------------------
     Helpers
  ----------------------------- */

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  const getIcon = () => {
    switch (item.category) {
      case "maintenance":
        return <Wrench size={20} className="text-blue-600" />;
      case "security":
        return <ShieldAlert size={20} className="text-red-600" />;
      case "noise":
        return <AlertCircle size={20} className="text-purple-600" />;
      default:
        return <AlertCircle size={20} className="text-amber-600" />;
    }
  };

  const STATUS_COLORS = {
    open: "bg-red-100 text-red-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-600",
  };

  /* -----------------------------
     🔐 Permissions (FINAL FIX)
  ----------------------------- */

  // Normalize createdBy (string or populated object)
  const createdById =
    typeof item.createdBy === "string"
      ? item.createdBy
      : item.createdBy?._id?.toString();

  const isOwner = Boolean(
    userId && createdById && createdById.toString() === userId.toString(),
  );

  const canEdit = role === "admin" || (isOwner && item.status === "open");

  const canDelete = role === "admin" || (isOwner && item.status === "open");

  /* -----------------------------
     Render
  ----------------------------- */

  return (
    <div
      onClick={() => onOpen(item)}
      className="relative group
        bg-white shadow-sm rounded-xl p-5 border border-gray-100
        hover:shadow-md hover:-translate-y-1 transition-all duration-200
        cursor-pointer h-full flex flex-col justify-between
      "
    >
      {/* Floating Actions */}
      {(canEdit || canDelete) && (
        <div
          className="absolute top-3 right-3 flex gap-1
                     opacity-0 group-hover:opacity-100 transition"
        >
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="p-1.5 rounded-lg bg-white shadow
                         hover:bg-gray-100 text-gray-700"
              title="Edit complaint"
            >
              <Edit size={14} />
            </button>
          )}

          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              className="p-1.5 rounded-lg bg-white shadow
                         hover:bg-red-50 text-red-600"
              title="Delete complaint"
            >
              <Trash size={14} />
            </button>
          )}
        </div>
      )}

      {/* Top */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {getIcon()}
            <h2 className="text-base font-semibold text-gray-800 truncate">
              {item.title}
            </h2>
          </div>
        </div>

        <p className="mt-3 text-gray-700 text-sm line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Bottom */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={14} />
          {formatDate(item.createdAt)}
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full capitalize text-[11px]
          ${STATUS_COLORS[item.status]}`}
        >
          {item.status.replace("_", " ")}
        </span>
      </div>
    </div>
  );
}
