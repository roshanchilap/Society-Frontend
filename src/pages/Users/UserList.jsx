import { useState, useMemo } from "react";
import FilterBar from "../../components/common/FilterBar";
import { useSocietyStore } from "../../store/useAdminStore";
import UserSkeleton from "./UserSkeleton";
import Modal from "../../components/common/Modal";
import axiosClient from "../../api/axiosClient";
import Pagination from "../../components/common/Pagination";
import toast from "react-hot-toast";
import UserCard from "./UserCARD.JSX";

export default function UserList() {
  const users = useSocietyStore((s) => s.users);
  const flats = useSocietyStore((s) => s.flats);
  const fetchAll = useSocietyStore((s) => s.fetchAll);
  const loading = useSocietyStore((s) => s.loading);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [openModal, setOpenModal] = useState(false);

  // PAGINATION
  const [page, setPage] = useState(1);
  const perPage = 8;

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    flatId: "",
    phoneno: "",
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "", // optional
      role: user.role,
      flatId: user.flatId || "",
      phoneno: user.phoneno,
    });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await axiosClient.put(`/users/${selectedUser._id}`, form);
      setEditModal(false);
      setSelectedUser(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Filter logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        search.trim() === "" ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());

      const matchRole = role === "" || u.role === role;

      return matchSearch && matchRole;
    });
  }, [users, search, role]);

  // Paginated slice
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const totalPages = Math.ceil(filteredUsers.length / perPage);

  // Create user
  const handleSubmit = async () => {
    try {
      await axiosClient.post("/users/create", form);

      setOpenModal(false);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
        flatId: "",
        phoneno: "",
      });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  // Delete user
  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosClient.delete(`/users/${selectedUser._id}`);
      setDeleteModal(false);
      setSelectedUser(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      {editModal && (
        <Modal
          title="Edit User"
          onClose={() => setEditModal(false)}
          footer={[
            <button
              key="cancel"
              onClick={() => setEditModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>,
            <button
              key="save"
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update
            </button>,
          ]}
        >
          <div className="space-y-4">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
            />

            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
            />
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Phone Number"
              value={form.phoneno}
              onChange={(e) => updateForm("phoneno", e.target.value)}
            />

            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="New Password (optional)"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
            />

            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.role}
              onChange={(e) => updateForm("role", e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
            </select>

            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.flatId}
              onChange={(e) => updateForm("flatId", e.target.value)}
            >
              <option value="">Assign Flat</option>
              {flats.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.tower}-{f.flatNumber}
                </option>
              ))}
            </select>
          </div>
        </Modal>
      )}
      {deleteModal && (
        <Modal
          title="Delete User"
          onClose={() => setDeleteModal(false)}
          footer={[
            <button
              key="cancel"
              onClick={() => setDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>,
            <button
              key="delete"
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>,
          ]}
        >
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <strong>{selectedUser?.name}</strong>?
          </p>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add User
        </button>
      </div>

      {/* Add User Modal */}
      {openModal && (
        <Modal
          title="Add User"
          onClose={() => setOpenModal(false)}
          footer={[
            <button
              key="cancel"
              onClick={() => setOpenModal(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>,
            <button
              key="save"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>,
          ]}
        >
          {/* FORM */}
          <div className="space-y-4">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
            />

            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Email"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
            />
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Phone Number"
              value={form.phoneno}
              onChange={(e) => updateForm("phoneno", e.target.value)}
            />

            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Password"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
            />

            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.role}
              onChange={(e) => updateForm("role", e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
            </select>

            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.flatId}
              onChange={(e) => updateForm("flatId", e.target.value)}
            >
              <option value="">Assign Flat</option>
              {flats.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.address?.tower}-{f.flatNumber}
                </option>
              ))}
            </select>
          </div>
        </Modal>
      )}

      {/* USERS LIST */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <UserSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <FilterBar
            filters={[
              {
                type: "text",
                label: "Search",
                value: search,
                placeholder: "Name or email",
                onChange: setSearch,
              },
              {
                type: "select",
                label: "Role",
                value: role,
                onChange: setRole,
                options: [
                  { value: "", label: "All" },
                  { value: "admin", label: "Admin" },
                  { value: "owner", label: "Owner" },
                  { value: "tenant", label: "Tenant" },
                ],
              },
            ]}
            onClear={() => {
              setSearch("");
              setRole("");
            }}
          />

          {filteredUsers.length === 0 ? (
            <p className="text-gray-600 mt-6">No users found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                {paginatedUsers.map((u) => (
                  <UserCard
                    key={u._id}
                    user={u}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* PAGINATION */}
              <div className="flex justify-center items-center gap-2 mt-8">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
