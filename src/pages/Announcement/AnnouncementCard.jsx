import { Bell, Info, AlertTriangle, Calendar, Edit, Trash } from "lucide-react";

export default function NoticeCard({
  item,
  onEdit,
  onDelete,
  isAdmin,
  onOpen,
}) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const created =
    item?.createdAt && !isNaN(new Date(item.createdAt))
      ? formatDate(item.createdAt)
      : "N/A";

  const getIcon = () => {
    switch (item.type) {
      case "maintenance":
        return <Info size={20} className="text-blue-600" />;
      case "meeting":
        return <Bell size={20} className="text-green-600" />;
      case "event":
        return <Bell size={20} className="text-purple-600" />;
      default:
        return <AlertTriangle size={20} className="text-amber-600" />;
    }
  };

  const getBadgeColor = () => {
    switch (item.type) {
      case "maintenance":
        return "bg-blue-100 text-blue-600";
      case "meeting":
        return "bg-green-100 text-green-600";
      case "event":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div
      onClick={() => onOpen(item)}
      className="
        bg-white shadow-sm rounded-xl p-5 border border-gray-100
        hover:shadow-md hover:-translate-y-1 transition-all duration-200 
        cursor-pointer h-full flex flex-col justify-between
      "
    >
      {/* Top */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {getIcon()}
            <h2 className="text-base font-semibold text-gray-800 truncate">
              {item.title}
            </h2>
          </div>

          <span
            className={`px-3 py-1 text-[10px] uppercase rounded-full tracking-wide ${getBadgeColor()}`}
          >
            {item.type}
          </span>
        </div>

        {/* Message (clamped) */}
        <p className="mt-3 text-gray-700 text-sm line-clamp-2 leading-relaxed">
          {item.message}
        </p>
      </div>

      {/* Bottom */}
      <div className="mt-4">
        {/* Date */}
        <p className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Calendar size={14} /> {created}
        </p>

        {/* Admin buttons */}
        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="flex items-center justify-center gap-2 w-full py-2 
                         rounded-lg border border-gray-300 text-gray-700 
                         hover:bg-gray-100 transition text-sm"
            >
              <Edit size={16} />
              Edit
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              className="flex items-center justify-center gap-2 w-full py-2 
                         rounded-lg border border-red-300 text-red-600
                         hover:bg-red-50 transition text-sm"
            >
              <Trash size={16} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
