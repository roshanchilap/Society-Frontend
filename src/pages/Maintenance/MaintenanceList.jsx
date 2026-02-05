import { useEffect, useState, useMemo, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import FilterBar from "../../components/common/FilterBar";
import MaintenanceCard from "./MaintenanceCard";
import MaintenanceSkeleton from "./MaintenanceSkeleton";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import { useSocietyStore } from "../../store/useAdminStore";
import { useAuthStore } from "../../auth/useAuthStore";
import { useOwnerStore } from "../../store/useOwnerStore";
import toast from "react-hot-toast";
import { Download, FileDown, FileText, Plus } from "lucide-react";


export default function MaintenanceList() {
  const role = useAuthStore((s) => s.role);

  // ADMIN STORE
  const adminMaintenance = useSocietyStore((s) => s.maintenance);
  const adminFlats = useSocietyStore((s) => s.flats);
  const adminLoading = useSocietyStore((s) => s.loading);
  const adminGetMaintenance = useSocietyStore((s) => s.getMaintenance);
  const adminGetFlats = useSocietyStore((s) => s.getFlats);

  // OWNER STORE
  const ownerMaintenance = useOwnerStore((s) => s.maintenance);
  const ownerLoading = useOwnerStore((s) => s.loading);
  const loadMyMaintenance = useOwnerStore((s) => s.loadMyMaintenance);
  const getMaintenance = useSocietyStore((s) => s.getMaintenance);

  // FINAL DATA (based on role)
  const maintenance = role === "admin" ? adminMaintenance : ownerMaintenance;
  const flats = role === "admin" ? adminFlats : []; // owners do NOT choose flats
  const loading = role === "admin" ? adminLoading : ownerLoading;

  useEffect(() => {
    if (role === "admin") {
      adminGetFlats();
      adminGetMaintenance();
    } else {
      loadMyMaintenance();
    }
  }, [role]);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 8;

  // -------- FILTERS --------
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const filteredMaintenance = useMemo(() => {
    return maintenance.filter((m) => {
      const flatNo = m.flatId?.flatNumber || "";

      const matchSearch =
        search.trim() === "" ||
        flatNo.toLowerCase().includes(search.toLowerCase());

      const matchStatus = status === "" || m.status === status;

      return matchSearch && matchStatus;
    });
  }, [maintenance, search, status]);

  // -------- PAGINATION CALC --------
  const totalPages = Math.ceil(filteredMaintenance.length / perPage);

  const paginatedItems = filteredMaintenance.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  // Reset page if filtering reduces items
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  // -------- ADD / EDIT FORM --------
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [form, setForm] = useState({
    flatId: "",
    amount: "",
    dueDate: "",
    status: "pending",
    notes: "",
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  const openAddForm = () => {
    setEditItem(null);
    setForm({
      flatId: "",
      amount: "",
      dueDate: "",
      status: "pending",
      notes: "",
    });
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditItem(item);
    setForm({
      flatId: item.flatId?._id || "",
      amount: item.amount,
      dueDate: item.dueDate?.slice(0, 10) || "",
      status: item.status,
      notes: item.notes || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setEditItem(null);
    setShowForm(false);
  };

  // -------- SAVE (Add + Edit) --------
  const saveMaintenance = async () => {
    try {
      if (editItem) {
        await axiosClient.put(`/maintenance/${editItem._id}`, form);
      } else {
        await axiosClient.post("/maintenance/create", form);
      }

      await getMaintenance();
      toast.success(
        editItem
          ? "Maintenance updated successfully"
          : "Maintenance added successfully",
      );

      closeForm();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Unable to save maintenance. Please try again.";

      toast.error(msg);
    }
  };

  // -------- DELETE --------
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const deleteMaintenance = async () => {
    try {
      await axiosClient.delete(`/maintenance/${deleteId}`);
      await getMaintenance();

      setShowDeleteModal(false);
      toast.success("Maintenance record deleted successfully");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Unable to delete maintenance. Please try again.";

      toast.error(msg);
    }
  };
  const downloadCSV = async () => {
    try {
      const res = await axiosClient.get("/maintenance/export/csv", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "maintenance.csv";
      a.click();
      toast.success("File is downloading!");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to download CSV. Please try again.",
      );
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await axiosClient.get("/maintenance/export/pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "maintenance.pdf";
      a.click();
      toast.success("PDF is downloading!");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to download PDF. Please try again.",
      );
    }
  };

    const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div>
      {role === "admin" && (
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 className="text-lg sm:text-2xl font-semibold">
        Maintenance
      </h1>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Download dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="
              flex items-center gap-2
              bg-gray-900 text-white
              px-4 py-2.5
              rounded-lg shadow
              text-sm
              hover:bg-gray-800 transition
              active:scale-95
            "
          >
            <Download size={16} />
            Download
          </button>

          {open && (
            <div className="
              absolute right-0 mt-2
              w-40
              bg-white
              border border-gray-200
              rounded-lg shadow-lg
              z-20
            ">
              <button
                onClick={() => {
                  downloadCSV();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <FileDown size={14} />
                Excel (CSV)
              </button>

              <button
                onClick={() => {
                  downloadPDF();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <FileText size={14} />
                PDF
              </button>
            </div>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={openAddForm}
          className="
            flex items-center gap-2
            bg-blue-600 text-white
            px-4 py-2.5
            rounded-lg shadow
            text-sm
            hover:bg-blue-700 transition
            active:scale-95
          "
        >
          <Plus size={16} />
          Add
        </button>
      </div>
    </div>


      )}
      {/* FILTERS */}
      <FilterBar
        filters={[
          {
            type: "text",
            label: "Search Flat",
            value: search,
            placeholder: "101",
            onChange: setSearch,
          },
          {
            type: "select",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "", label: "All" },
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
            ],
          },
        ]}
        onClear={() => {
          setSearch("");
          setStatus("");
        }}
      />

      {/* LIST */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <MaintenanceSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {paginatedItems.length === 0 ? (
            <p className="text-gray-600">No maintenance records found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedItems.map((m) => (
                  <MaintenanceCard
                    key={m._id}
                    item={m}
                    onEdit={() => openEditForm(m)}
                    onDelete={() => {
                      setDeleteId(m._id);
                      setShowDeleteModal(true);
                    }}
                  />
                ))}
              </div>

              {/* PAGINATION */}
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <Modal
          title="Delete Maintenance"
          onClose={() => setShowDeleteModal(false)}
          footer={
            <>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={deleteMaintenance}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </>
          }
        >
          Are you sure you want to delete this record?
        </Modal>
      )}

      {/* ADD / EDIT FORM MODAL */}
      {showForm && (
        <Modal
          title={editItem ? "Edit Maintenance" : "Add Maintenance"}
          onClose={closeForm}
          footer={
            <>
              <button
                onClick={closeForm}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveMaintenance}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label>Flat</label>
              <select
                className="w-full border rounded-lg p-3"
                value={form.flatId}
                onChange={(e) => update("flatId", e.target.value)}
              >
                <option value="">Select Flat</option>
                {flats.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.address?.tower}-{f.flatNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Amount</label>
              <input
                className="w-full border rounded-lg p-3"
                type="number"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
              />
            </div>

            <div>
              <label>Due Date</label>
              <input
                className="w-full border rounded-lg p-3"
                type="date"
                value={form.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
              />
            </div>

            <div>
              <label>Status</label>
              <select
                className="w-full border rounded-lg p-3"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label>Notes</label>
              <textarea
                className="w-full border rounded-lg p-3"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
