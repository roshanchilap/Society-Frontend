import { Edit, Trash, Phone, Mail } from "lucide-react";

export default function UserCard({ user, onEdit, onDelete }) {
  const gradients = [
    "from-blue-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-amber-500",
    "from-rose-500 to-red-500",
  ];

  const gradient = gradients[user.name.charCodeAt(0) % gradients.length];

  return (
    <div
      className="relative group rounded-2xl p-[1px]
                 bg-gradient-to-br from-gray-200 to-gray-100
                 hover:from-blue-200 hover:to-purple-200 transition"
    >
      <div
        className="relative rounded-2xl bg-white/80 backdrop-blur
                   border border-white/60 p-4 shadow-sm
                   hover:shadow-lg transition"
      >
        {/* Floating Actions */}
        <div
          className="absolute top-3 right-3 flex gap-1 opacity-0
                     group-hover:opacity-100 transition"
        >
          <button
            onClick={() => onEdit(user)}
            className="p-1.5 rounded-lg bg-white shadow
                       hover:bg-gray-100 text-gray-700"
          >
            <Edit size={14} />
          </button>

          <button
            onClick={() => onDelete(user)}
            className="p-1.5 rounded-lg bg-white shadow
                       hover:bg-red-50 text-red-600"
          >
            <Trash size={14} />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          {/* Gradient Avatar */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center
                        text-white font-semibold shadow-md
                        bg-gradient-to-br ${gradient}`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {user.name}
            </h2>

            <span
              className={`inline-block mt-0.5 text-[11px] capitalize px-2 py-0.5 rounded-full
                ${
                  user.role === "admin"
                    ? "bg-green-100 text-green-700"
                    : user.role === "owner"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                }`}
            >
              {user.role}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={13} className="text-gray-400" />
            <span className="truncate">{user.email}</span>
          </div>

          {user.phoneno && (
            <div
              className="inline-flex items-center gap-2
                         px-3 py-1.5 rounded-lg
                         bg-gradient-to-r from-blue-50 to-purple-50
                         border border-blue-100 text-gray-800 font-medium"
            >
              <Phone size={13} className="text-blue-500" />
              <span>{user.phoneno}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
