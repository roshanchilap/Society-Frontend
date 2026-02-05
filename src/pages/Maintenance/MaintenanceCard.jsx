import { Calendar, FileText, Home, Edit, Trash, Download } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../auth/useAuthStore";
import { useState } from "react";

export default function MaintenanceCard({ item, onEdit, onDelete }) {
  const role = useAuthStore((s) => s.role); // <-- IMPORTANT
  const dueDate = new Date(item.dueDate).toLocaleDateString();
  const [downloading, setDownloading] = useState(false); // NEW state

  const downloadSlip = async () => {
    try {
      setDownloading(true); // start loading
      const res = await axiosClient.get(`/maintenance/${item._id}/slip`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `slip-${item.slipNumber || item._id}.pdf`;
      a.click();
    } catch (err) {
      console.error("Slip download failed:", err);
    } finally {
      setDownloading(false); // stop loading
    }
  };

  const slipAvailable = item.status === "paid" && item.slipNumber;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home size={18} className="text-blue-500" />
          <h2 className="text-base font-semibold text-gray-800">
            {item.flatId.address?.tower}-{item.flatId.flatNumber}
          </h2>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
            ${
              item.status === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }
          `}
        >
          {item.status}
        </span>
      </div>

      {/* INFO */}
      <div className="mt-3 text-sm text-gray-700 space-y-1.5">
        <p>
          <span className="font-semibold">Amount:</span> ₹{item.amount}
        </p>

        <p className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-500" />
          <span className="font-semibold">Due:</span> {dueDate}
        </p>

        <p className="flex items-center gap-2">
          <FileText size={14} className="text-gray-500" />
          <span className="font-semibold">Slip:</span>{" "}
          {item.slipNumber ? item.slipNumber : "Not generated"}
        </p>

        {item.notes && (
          <p className="text-gray-600">
            <span className="font-semibold">Notes:</span> {item.notes}
          </p>
        )}
      </div>

      {/* SLIP DOWNLOAD */}
      <div className="mt-4">
        {item.status === "pending" && (
          <div className="w-full py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium border border-gray-200 text-center">
            Slip not available (Pending)
          </div>
        )}

        {item.status === "paid" && !item.slipNumber && (
          <div className="w-full py-2 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-medium border border-yellow-300 text-center">
            Slip not generated yet
          </div>
        )}

        {slipAvailable && (
          <button
            onClick={downloadSlip}
            disabled={downloading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 
             rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600
             text-white text-sm font-semibold shadow-md
             transition active:scale-95
             ${downloading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
          >
            {downloading ? (
              <svg
                className="animate-spin h-4 w-4 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                ></path>
              </svg>
            ) : (
              <Download size={16} className="opacity-90" />
            )}
            {downloading ? "Downloading..." : "Download Receipt"}
          </button>
        )}
      </div>

      {/* ADMIN ACTIONS */}
      {role === "admin" && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => onEdit(item)}
            className="flex items-center justify-center gap-1.5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm font-medium active:scale-95"
          >
            <Edit size={15} />
            Edit
          </button>

          <button
            onClick={() => onDelete(item)}
            className="flex items-center justify-center gap-1.5 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition text-sm font-medium active:scale-95"
          >
            <Trash size={15} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}