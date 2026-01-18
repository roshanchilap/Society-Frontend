import { AlertTriangle, Calendar, FileText } from "lucide-react";
import { useAuthStore } from "../../../auth/useAuthStore";
import { useSocietyStore } from "../../../store/useAdminStore";
import { useOwnerStore } from "../../../store/useOwnerStore";

export default function MaintenanceDueWidget() {
  const role = useAuthStore((s) => s.role);

  const adminMaintenance = useSocietyStore((s) => s.maintenance);
  const ownerMaintenance = useOwnerStore((s) => s.maintenance);

  const items = role === "admin" ? adminMaintenance : ownerMaintenance;

  // SHOW ONLY PENDING dues
  const pending = items.filter((m) => m.status === "pending");

  // limit to 3
  const latest = [...pending]
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  // helper: convert cycleMonth to month name
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0).getDate(); // month is 1–12
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-700">
        <AlertTriangle size={18} /> Upcoming Dues
      </h3>

      {latest.length === 0 && (
        <p className="text-gray-500 text-sm">No pending maintenance</p>
      )}

      <ul className="space-y-3">
        {latest.map((m) => {
          const monthName = monthNames[m.cycleMonth - 1];
          const lastDay = getLastDayOfMonth(m.cycleYear, m.cycleMonth);

          return (
            <li
              key={m._id}
              className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm hover:bg-red-100 transition"
            >
              {/* Flat */}
              <div className="font-semibold text-gray-800 mb-1">
                Flat {m.flatId.address.tower}-{m.flatId.flatNumber}
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700">Amount</span>
                <span className="font-semibold text-red-600">₹{m.amount}</span>
              </div>

              {/* Cycle */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700">Cycle</span>
                <span className="font-medium">
                  {monthName} {m.cycleYear}
                </span>
              </div>

              {/* Due date */}
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-gray-700">
                  <Calendar size={14} /> Due Before
                </span>
                <span className="font-medium">
                  {lastDay} {monthName} {m.cycleYear}
                </span>
              </div>

              {/* Notes */}
              {m.notes && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  <FileText size={12} className="inline-block mr-1" />
                  {m.notes}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
