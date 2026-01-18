import { useEffect, useState, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import FilterBar from "../../components/common/FilterBar";

import FlatCard from "./FlatCard";
import FlatSkeleton from "./FlatSkeleton";
import { useSocietyStore } from "../../store/useAdminStore";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";

export default function FlatList() {
  const flats = useSocietyStore((s) => s.flats);
  const loading = useSocietyStore((s) => s.loading);
  const getFlats = useSocietyStore((s) => s.getFlats);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Form state for Add/Edit
  const [form, setForm] = useState({
    flatNumber: "",
    areaSqFt: "",
    tower: "",
    floor: "",
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  // Load flats on mount
  useEffect(() => {
    getFlats();
  }, []);

  // Filters
  const [search, setSearch] = useState("");
  const [tower, setTower] = useState("");
  const [sort, setSort] = useState("");

  // Add/Edit modal state
  const [showForm, setShowForm] = useState(false);
  const [editFlat, setEditFlat] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 8;

  // Towers list
  const towerOptions = useMemo(() => {
    const set = new Set();
    flats.forEach((f) => f.address?.tower && set.add(f.address.tower));
    return Array.from(set);
  }, [flats]);

  // Filter + sort
  const processedFlats = useMemo(() => {
    let data = [...flats];

    if (search.trim()) {
      data = data.filter((f) =>
        f.flatNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (tower) {
      data = data.filter((f) => f.address?.tower === tower);
    }

    if (sort === "owner") {
      data.sort((a, b) =>
        (a.ownerId?.name || "").localeCompare(b.ownerId?.name || "")
      );
    } else if (sort === "status") {
      data.sort((a, b) => a.status.localeCompare(b.status));
    }

    return data;
  }, [flats, search, tower, sort]);

  // Pagination
  const totalPages = Math.ceil(processedFlats.length / perPage);
  const paginatedFlats = processedFlats.slice(
    (page - 1) * perPage,
    (page - 1) * perPage + perPage
  );

  // Add form
  const openAddForm = () => {
    setEditFlat(null);
    setForm({
      flatNumber: "",
      areaSqFt: "",
      tower: "",
      floor: "",
    });
    setShowForm(true);
  };

  // Edit form
  const openEditForm = (flat) => {
    setEditFlat(flat);
    setForm({
      flatNumber: flat.flatNumber,
      areaSqFt: flat.areaSqFt,
      tower: flat.address?.tower || "",
      floor: flat.address?.floor || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setEditFlat(null);
    setShowForm(false);
  };

  // Delete flat
  const deleteFlat = async (id) => {
    if (!confirm("Are you sure you want to delete this flat?")) return;
    try {
      await axiosClient.delete(`/flats/${id}`);
      await getFlats();
    } catch (err) {
      console.error("Error deleting flat:", err);
    }
  };

  // Save flat (Add/Edit)
  const saveFlat = async () => {
    try {
      if (editFlat) {
        await axiosClient.put(`/flats/${editFlat._id}`, {
          flatNumber: form.flatNumber,
          areaSqFt: form.areaSqFt,
          address: { tower: form.tower, floor: form.floor },
        });
      } else {
        await axiosClient.post("/flats/create", {
          flatNumber: form.flatNumber,
          areaSqFt: form.areaSqFt,
          tower: form.tower,
          floor: form.floor,
        });
      }

      await getFlats();
      closeForm();
    } catch (err) {
      console.error("Error saving flat:", err);
    }
  };

  // Skeleton
  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">Flats</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <FlatSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {showDeleteModal && (
        <Modal
          title="Delete Flat"
          onClose={() => setShowDeleteModal(false)}
          footer={
            <>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                No
              </button>

              <button
                onClick={async () => {
                  try {
                    await axiosClient.delete(`/flats/${deleteId}`);
                    await getFlats();
                    setShowDeleteModal(false);
                  } catch (err) {
                    console.error("Error deleting flat:", err);
                  }
                }}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </>
          }
        >
          <p className="text-gray-700">
            Are you sure you want to delete this flat?
          </p>
        </Modal>
      )}

      {/* ---------- COMMON MODAL FOR CREATE + EDIT ---------- */}
      {showForm && (
        <Modal
          title={editFlat ? "Edit Flat" : "Add Flat"}
          onClose={closeForm}
          footer={
            <>
              <button
                onClick={closeForm}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={saveFlat}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </>
          }
        >
          <div>
            <label className="block mb-1 font-medium">Flat Number</label>
            <input
              className="w-full border rounded-lg p-3"
              value={form.flatNumber}
              onChange={(e) => update("flatNumber", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Area (sq.ft)</label>
            <input
              className="w-full border rounded-lg p-3"
              value={form.areaSqFt}
              onChange={(e) => update("areaSqFt", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Tower</label>
            <input
              className="w-full border rounded-lg p-3"
              value={form.tower}
              onChange={(e) => update("tower", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Floor</label>
            <input
              className="w-full border rounded-lg p-3"
              value={form.floor}
              onChange={(e) => update("floor", e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* ---------- PAGE HEADER ---------- */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Flats</h1>
        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Flat
        </button>
      </div>

      {/* ---------- FILTERS ---------- */}
      <FilterBar
        filters={[
          {
            type: "text",
            label: "Search Flat",
            value: search,
            placeholder: "A-101",
            onChange: setSearch,
          },
          {
            type: "select",
            label: "Tower",
            value: tower,
            onChange: setTower,
            options: [
              { value: "", label: "All Towers" },
              ...towerOptions.map((t) => ({ value: t, label: "Tower " + t })),
            ],
          },
          {
            type: "select",
            label: "Sort By",
            value: sort,
            onChange: setSort,
            options: [
              { value: "", label: "Default" },
              { value: "owner", label: "Owner Name" },
              { value: "status", label: "Status" },
            ],
          },
        ]}
        onClear={() => {
          setSearch("");
          setTower("");
          setSort("");
        }}
      />

      {/* ---------- FLATS GRID ---------- */}
      {processedFlats.length === 0 && (
        <p className="text-gray-600">No flats found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedFlats.map((flat) => (
          <FlatCard
            key={flat._id}
            flat={flat}
            onEdit={() => openEditForm(flat)}
            onDelete={() => {
              setDeleteId(flat._id);
              setShowDeleteModal(true);
            }}
          />
        ))}
      </div>

      {/* ---------- PAGINATION ---------- */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
