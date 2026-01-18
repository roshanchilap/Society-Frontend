import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";
import FilterBar from "../../components/common/FilterBar";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import ComplaintCard from "./ComplaintCard";
import ComplaintSkeleton from "./ComplaintSkeleton";
import toast from "react-hot-toast";
import { useAuthStore } from "../../auth/useAuthStore";
import ComplaintComments from "./ComplaintComments";
import { useSocietyStore } from "../../store/useAdminStore";

/* ----------------------------------
   Badge color maps
---------------------------------- */
const STATUS_BADGE = {
  open: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-200 text-gray-700 border-gray-300",
};

const PRIORITY_BADGE = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-orange-100 text-orange-700 border-orange-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const CATEGORY_BADGE = {
  maintenance: "bg-indigo-100 text-indigo-700 border-indigo-200",
  security: "bg-red-100 text-red-700 border-red-200",
  noise: "bg-pink-100 text-pink-700 border-pink-200",
  billing: "bg-amber-100 text-amber-700 border-amber-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

/* ----------------------------------
   Reusable Badge
---------------------------------- */
function Badge({ label, className }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${className}`}
    >
      {label.replace("_", " ")}
    </span>
  );
}

export default function ComplaintList() {
  const role = useAuthStore((s) => s.role);
  const flats = useSocietyStore((s) => s.flats);

  const complaints = useSocietyStore((s) =>
    Array.isArray(s.complaints) ? s.complaints : [],
  );
  const loading = useSocietyStore((s) => s.complaintsLoading);
  const fetchComplaints = useSocietyStore((s) => s.fetchComplaints);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [deletingComplaint, setDeletingComplaint] = useState(null);
  const [saving, setSaving] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 6;

  // Create Modal
  const [openCreate, setOpenCreate] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "medium",
    flatId: "",
  });

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  /* ----------------------------------
     Create complaint
  ---------------------------------- */
  const handleCreateComplaint = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (role === "admin" && !form.flatId) {
      toast.error("Please select a flat");
      return;
    }

    try {
      const payload = { ...form };
      if (role !== "admin") delete payload.flatId;

      await axiosClient.post("/complaints/create", payload);
      toast.success("Complaint submitted");

      setOpenCreate(false);
      setForm({
        title: "",
        description: "",
        category: "other",
        priority: "medium",
        flatId: "",
      });

      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit complaint");
    }
  };

  /* ----------------------------------
     Admin: update status
  ---------------------------------- */
  const handleStatusChange = async (newStatus) => {
    if (!selectedComplaint || newStatus === selectedComplaint.status) return;

    try {
      setUpdatingStatus(true);
      await axiosClient.put(`/complaints/${selectedComplaint._id}/status`, {
        status: newStatus,
      });

      setSelectedComplaint((prev) => ({
        ...prev,
        status: newStatus,
      }));

      toast.success("Status updated");
      fetchComplaints();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* ----------------------------------
     Filters
  ---------------------------------- */
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        search === "" || c.title?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = status === "" || c.status === status;
      const matchPriority = priority === "" || c.priority === priority;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [complaints, search, status, priority]);

  const totalPages = Math.ceil(filteredComplaints.length / perPage);
  const paginatedComplaints = filteredComplaints.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  useEffect(() => {
    setPage(1);
  }, [search, status, priority]);

  const handleEditOpen = (complaint) => {
    setEditingComplaint(complaint);
    setForm({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      flatId: complaint.flatId?._id || "",
    });
  };

  const handleUpdateComplaint = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setSaving(true);

      await axiosClient.put(`/complaints/${editingComplaint._id}`, {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
      });

      toast.success("Complaint updated");
      setEditingComplaint(null);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComplaint = async () => {
    if (!deletingComplaint) return;

    try {
      await axiosClient.delete(`/complaints/${deletingComplaint._id}`);

      toast.success("Complaint deleted");
      setDeletingComplaint(null);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete complaint");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Complaints</h1>

        <button
          onClick={() => setOpenCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          New Complaint
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        filters={[
          {
            type: "text",
            label: "Search",
            value: search,
            onChange: setSearch,
          },
          {
            type: "select",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [{ value: "", label: "All" }, ...STATUS_OPTIONS],
          },
          {
            type: "select",
            label: "Priority",
            value: priority,
            onChange: setPriority,
            options: [
              { value: "", label: "All" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ],
          },
        ]}
        onClear={() => {
          setSearch("");
          setStatus("");
          setPriority("");
        }}
      />

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ComplaintSkeleton key={i} />
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <p className="text-gray-600 mt-6">No complaints found.</p>
      ) : (
        <>
          {/* Edit Complaint */}
          {editingComplaint && (
            <Modal
              title="Edit Complaint"
              onClose={() => setEditingComplaint(null)}
            >
              <input
                placeholder="Complaint title"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border"
              />

              <textarea
                rows={4}
                placeholder="Describe the issue"
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border resize-none"
              />

              <select
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-white"
              >
                <option value="maintenance">Maintenance</option>
                <option value="security">Security</option>
                <option value="noise">Noise</option>
                <option value="billing">Billing</option>
                <option value="other">Other</option>
              </select>

              <select
                value={form.priority}
                onChange={(e) => updateForm("priority", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditingComplaint(null)}
                  className="px-4 py-2 text-sm text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateComplaint}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </Modal>
          )}
          {/* Delete Complaint */}
          {deletingComplaint && (
            <Modal
              title="Delete Complaint"
              onClose={() => setDeletingComplaint(null)}
            >
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this complaint?
              </p>

              <p className="mt-2 text-sm font-medium text-gray-900">
                {deletingComplaint.title}
              </p>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setDeletingComplaint(null)}
                  className="px-4 py-2 text-sm text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteComplaint}
                  className="px-4 py-2 bg-red-600 text-white
                   rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </Modal>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {paginatedComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                item={complaint}
                onOpen={setSelectedComplaint}
                onEdit={handleEditOpen}
                onDelete={(c) => setDeletingComplaint(c)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
      {/* Create Complaint */}
      {/* Create Complaint */}
      {openCreate && (
        <Modal title="New Complaint" onClose={() => setOpenCreate(false)}>
          <input
            placeholder="Complaint title"
            value={form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border"
          />

          <textarea
            rows={4}
            placeholder="Describe the issue"
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border resize-none"
          />

          {role === "admin" && (
            <select
              value={form.flatId}
              onChange={(e) => updateForm("flatId", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-white"
            >
              <option value="">Select Flat</option>
              {flats.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.address?.tower}-{f.flatNumber}
                </option>
              ))}
            </select>
          )}

          <select
            value={form.category}
            onChange={(e) => updateForm("category", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-white"
          >
            <option value="maintenance">Maintenance</option>
            <option value="security">Security</option>
            <option value="noise">Noise</option>
            <option value="billing">Billing</option>
            <option value="other">Other</option>
          </select>

          <select
            value={form.priority}
            onChange={(e) => updateForm("priority", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button
            onClick={handleCreateComplaint}
            className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </Modal>
      )}

      {/* View Complaint */}
      {selectedComplaint && (
        <Modal title="Complaint" onClose={() => setSelectedComplaint(null)}>
          <h3 className="text-lg font-semibold">{selectedComplaint.title}</h3>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              label={selectedComplaint.category}
              className={CATEGORY_BADGE[selectedComplaint.category]}
            />

            <Badge
              label={selectedComplaint.priority}
              className={PRIORITY_BADGE[selectedComplaint.priority]}
            />

            {role === "admin" ? (
              <select
                value={selectedComplaint.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                  capitalize bg-white ${STATUS_BADGE[selectedComplaint.status]}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            ) : (
              <Badge
                label={selectedComplaint.status}
                className={STATUS_BADGE[selectedComplaint.status]}
              />
            )}
          </div>

          <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">
            {selectedComplaint.description}
          </p>

          <div className="mt-5">
            <ComplaintComments
              complaintId={selectedComplaint._id}
              onClose={() => setSelectedComplaint(null)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
