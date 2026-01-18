import { Home, User, Users, Edit, Trash } from "lucide-react";

export default function FlatCard({ flat, onClick, onEdit, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm 
                 hover:shadow-md transition cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex gap-2 items-center text-gray-800">
          <Home size={18} className="text-blue-600" />
          {flat.address?.tower}-{flat.flatNumber}
        </h2>

        <span
          className={`px-3 py-0.5 text-xs rounded-full capitalize font-medium ${
            flat.status === "occupied"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {flat.status}
        </span>
      </div>

      {/* Body */}
      <div className="mt-3 space-y-1 text-sm text-gray-700">
        <p>Floor: {flat.address?.floor}</p>
        <p>Area: {flat.areaSqFt} sq.ft</p>

        <p className="flex items-center gap-2">
          <User size={14} />
          Owner: {flat.ownerId?.name || "—"}
        </p>

        <p className="flex items-center gap-2">
          <Users size={14} />
          Tenant: {flat.tenantId?.name || "—"}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Edit */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex items-center justify-center gap-2 py-2 
                     rounded-lg border border-gray-300 text-gray-700 
                     hover:bg-gray-100 transition text-sm font-medium"
        >
          <Edit size={15} />
          Edit
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center justify-center gap-2 py-2 
                     rounded-lg border border-red-300 text-red-600 
                     hover:bg-red-50 transition text-sm font-medium"
        >
          <Trash size={15} />
          Delete
        </button>
      </div>
    </div>
  );
}
