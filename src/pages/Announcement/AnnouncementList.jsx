import { useState, useMemo, useEffect } from "react";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementSkeleton from "./AnnouncementSkeleteon";

import { useSocietyStore } from "../../store/useAdminStore";
import { useOwnerStore } from "../../store/useOwnerStore";

import FilterBar from "../../components/common/FilterBar";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../auth/useAuthStore";

export default function NoticeList() {
  const role = useAuthStore((s) => s.role);

  // Admin sees all notices (or registry later if you want)
  const adminNotices = useSocietyStore((s) => s.notices || []);

  // Owner sees personal notices
  const ownerNotices = useOwnerStore((s) => s.notices || []);

  const notices = role === "admin" ? adminNotices : ownerNotices;

  const loading =
    role === "admin"
      ? useSocietyStore((s) => s.loading)
      : useOwnerStore((s) => s.loading);

  const fetchAll = useSocietyStore.getState().fetchAll;

  const users = useSocietyStore((s) => s.users);

  // ----------------- STATE -----------------
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const [viewItem, setViewItem] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    category: "general",
    userId: "",
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  // ----------------- FILTER -----------------
  const filtered = useMemo(() => {
    return notices.filter((n) => {
      const m1 =
        title.trim() === "" ||
        n.title.toLowerCase().includes(title.toLowerCase());
      const m2 = category === "" || n.type === category;
      return m1 && m2;
    });
  }, [notices, title, category]);

  useEffect(() => setPage(1), [title, category]);

  useEffect(() => {
    if (role === "admin") {
      useSocietyStore.getState().fetchAll();
    } else {
      useOwnerStore.getState().loadMyNotices();
    }
  }, [role]);

  const perPage = 8;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // ----------------- CREATE -----------------
  const openAddForm = () => {
    setForm({ title: "", message: "", category: "general", userId: "" });
    setShowForm(true);
  };

  const saveNotice = async () => {
    try {
      const payload =
        form.category === "maintenance"
          ? form
          : {
              title: form.title,
              message: form.message,
              category: form.category,
            };

      await axiosClient.post("/notices/create", payload);

      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert("Failed to create notice");
    }
  };

  // ----------------- EDIT -----------------
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title,
      message: item.message,
      category: item.type,
      userId: "",
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    try {
      await axiosClient.put(`/notices/${editItem._id}`, {
        title: form.title,
        message: form.message,
        category: form.category,
      });

      setShowEdit(false);
      fetchAll();
    } catch (err) {
      alert("Failed to update notice");
    }
  };

  // ----------------- DELETE -----------------
  const openDelete = (item) => {
    setDeleteId(item._id);
    setShowDelete(true);
  };

  const deleteNotice = async () => {
    try {
      await axiosClient.delete(`/notices/${deleteId}`);
      setShowDelete(false);
      fetchAll();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // ----------------- RENDER -----------------
  return (
    <div>
      {/* ---------------- VIEW MODAL ---------------- */}
      {viewItem && (
        <Modal
          title={viewItem.title}
          onClose={() => setViewItem(null)}
          footer={[
            <button
              key="close"
              onClick={() => setViewItem(null)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
            >
              Close
            </button>,
          ]}
        >
          <p className="text-gray-700 whitespace-pre-line">
            {viewItem.message}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Posted on: {new Date(viewItem.createdAt).toLocaleDateString()}
          </p>
        </Modal>
      )}

      {/* ---------------- CREATE MODAL ---------------- */}
      {showForm && (
        <Modal
          title="Create Notice"
          onClose={() => setShowForm(false)}
          footer={[
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>,
            <button
              onClick={saveNotice}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg"
            >
              Save
            </button>,
          ]}
        >
          <div className="space-y-4">
            <input
              className="w-full p-3 border rounded-lg"
              value={form.title}
              placeholder="Title"
              onChange={(e) => update("title", e.target.value)}
            />

            <textarea
              className="w-full p-3 border rounded-lg"
              value={form.message}
              placeholder="Message"
              onChange={(e) => update("message", e.target.value)}
            />

            <select
              className="w-full p-3 border rounded-lg"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="general">General</option>
              <option value="event">Event</option>
              <option value="meeting">Meeting</option>
              <option value="maintenance">Maintenance (Individual)</option>
            </select>

            {form.category === "maintenance" && (
              <select
                className="w-full p-3 border rounded-lg"
                value={form.userId}
                onChange={(e) => update("userId", e.target.value)}
              >
                <option value="">Select user...</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} - {u.email}
                  </option>
                ))}
              </select>
            )}
          </div>
        </Modal>
      )}

      {/* ---------------- EDIT MODAL ---------------- */}
      {showEdit && (
        <Modal
          title="Edit Notice"
          onClose={() => setShowEdit(false)}
          footer={[
            <button
              onClick={() => setShowEdit(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>,
            <button
              onClick={saveEdit}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg"
            >
              Update
            </button>,
          ]}
        >
          <div className="space-y-4">
            <input
              className="w-full p-3 border rounded-lg"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />

            <textarea
              className="w-full p-3 border rounded-lg"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
            />

            <select
              className="w-full p-3 border rounded-lg"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="general">General</option>
              <option value="event">Event</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
        </Modal>
      )}

      {/* ---------------- DELETE MODAL ---------------- */}
      {showDelete && (
        <Modal
          title="Delete Notice"
          onClose={() => setShowDelete(false)}
          footer={[
            <button
              onClick={() => setShowDelete(false)}
              className="px-4 py-2 border rounded-lg"
            >
              No
            </button>,
            <button
              onClick={deleteNotice}
              className="px-5 py-2 bg-red-600 text-white rounded-lg"
            >
              Yes, Delete
            </button>,
          ]}
        >
          Are you sure you want to delete this notice?
        </Modal>
      )}

      {/* ---------------- HEADER ---------------- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Notices</h1>

        {role === "admin" && (
          <button
            onClick={openAddForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Notice
          </button>
        )}
      </div>

      {/* ---------------- FILTERS ---------------- */}
      <FilterBar
        filters={[
          {
            type: "text",
            label: "Search Title",
            value: title,
            placeholder: "Meeting, Event, Maintenance...",
            onChange: setTitle,
          },
          {
            type: "select",
            label: "Category",
            value: category,
            onChange: setCategory,
            options: [
              { value: "", label: "All" },
              { value: "general", label: "General" },
              { value: "event", label: "Event" },
              { value: "meeting", label: "Meeting" },
              { value: "maintenance", label: "Maintenance" },
            ],
          },
        ]}
        onClear={() => {
          setTitle("");
          setCategory("");
        }}
      />

      {/* ---------------- LIST ---------------- */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <AnnouncementSkeleton key={i} />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <p className="text-gray-600">No notices found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginated.map((item) => (
              <AnnouncementCard
                key={item._id}
                item={item}
                onOpen={() => setViewItem(item)}
                onEdit={role === "admin" ? openEdit : undefined}
                onDelete={role === "admin" ? openDelete : undefined}
                isAdmin={role === "admin"}
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
    </div>
  );
}
