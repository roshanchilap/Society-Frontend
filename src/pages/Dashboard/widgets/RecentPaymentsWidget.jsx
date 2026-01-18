import {
  CheckCircle,
  Home,
  Calendar,
  Download,
  IndianRupee,
  FileText,
} from "lucide-react";
import axiosClient from "../../../api/axiosClient";
import { useAuthStore } from "../../../auth/useAuthStore";
import { useSocietyStore } from "../../../store/useAdminStore";
import { useOwnerStore } from "../../../store/useOwnerStore";

export default function RecentPaymentsWidget() {
  const role = useAuthStore((s) => s.role);

  const adminMaintenance = useSocietyStore((s) => s.maintenance);
  const ownerMaintenance = useOwnerStore((s) => s.maintenance);

  const items =
    role === "admin"
      ? adminMaintenance.filter((m) => m.status === "paid")
      : ownerMaintenance.filter((m) => m.status === "paid");

  const downloadSlip = async (id, slipNumber) => {
    try {
      const res = await axiosClient.get(`/maintenance/${id}/slip`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `maintenance-slip-${slipNumber}.pdf`;
      a.click();
    } catch (err) {
      console.error("Slip download failed:", err);
    }
  };

  const formatFlat = (m) => {
    const flat = m.flatId;
    if (!flat || typeof flat !== "object") return "Unknown";
    return `${flat.address?.tower || "-"}-${flat.flatNumber || "-"}`;
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-700">
        <CheckCircle size={20} /> Recent Payments
      </h3>

      {items.length === 0 && (
        <p className="text-gray-500 text-sm">No payments found</p>
      )}

      <ul className="space-y-4">
        {items.slice(0, 2).map((m) => (
          <li
            key={m._id}
            className="bg-green-50 border border-green-100 rounded-xl p-4 hover:bg-green-100 transition shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home size={18} className="text-green-700" />
                <p className="font-semibold text-gray-900 text-sm">
                  {formatFlat(m)}
                </p>
              </div>

              <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800 font-semibold">
                Paid
              </span>
            </div>

            {/* Info */}
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <IndianRupee size={16} className="text-green-600" />
                <span className="font-semibold">Amount:</span> ₹{m.amount}
              </div>

              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                <span className="font-semibold">Slip:</span>{" "}
                {m.slipNumber || "Not available"}
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-600" />
                <span className="font-semibold">Paid:</span>{" "}
                {new Date(m.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Download */}
            {m.slipNumber && (
              <button
                onClick={() => downloadSlip(m._id, m.slipNumber)}
                className="mt-4 flex items-center gap-1 text-xs px-3 py-1.5 
                bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all
                shadow-sm active:scale-95"
              >
                <Download size={14} /> Download Slip
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
