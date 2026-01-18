import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../auth/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Building2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm] = useState({
    societyCode: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let e = {};

    if (!form.societyCode.trim()) e.societyCode = "Society code is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Invalid email format.";

    if (!form.password.trim()) e.password = "Password is required.";
    else if (form.password.length < 6)
      e.password = "Minimum 6 characters required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(form.societyCode, form.email, form.password);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Section */}
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-10">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-extrabold mb-4 drop-shadow-lg">
            Welcome to Society Portal
          </h1>
          <p className="text-lg opacity-90">
            Manage flats, maintenance, announcements, and users with ease. A
            secure, smart, and modern system for your society.
          </p>
        </div>
      </div>

      {/* Right Section (Login Card) */}
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div
          className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-2xl 
          shadow-xl border border-gray-200 animate-fadeIn"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Society Code */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Society Code
              </label>
              <div className="relative mt-1">
                <Building2
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={form.societyCode}
                  onChange={(e) =>
                    setForm({ ...form, societyCode: e.target.value })
                  }
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white 
                    focus:ring-2 focus:ring-blue-400 focus:outline-none
                    ${
                      errors.societyCode ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Enter society code"
                />
              </div>
              {errors.societyCode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.societyCode}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="relative mt-1">
                <Mail
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white
                    focus:ring-2 focus:ring-blue-400 focus:outline-none
                    ${errors.email ? "border-red-500" : "border-gray-300"}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>
              <div className="relative mt-1">
                <Lock
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white 
                    focus:ring-2 focus:ring-blue-400 focus:outline-none
                    ${errors.password ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter password"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Button */}
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                         text-white py-2 rounded-lg font-medium shadow-md 
                         hover:shadow-lg hover:opacity-90 transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
