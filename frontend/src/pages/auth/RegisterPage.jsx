import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    specialization: "",
    bio: "",
    experienceYears: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === "experienceYears" ? Number(value) : value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      if (form.role === "doctor") {
        payload.specialization = form.specialization;
        payload.bio = form.bio;
        payload.experienceYears = form.experienceYears;
      }

      const { data } = await api.post("/auth/register", payload);
      login(data.token, data.user);
      toast.success("Account created successfully!");

      if (data.user.role === "doctor" && !data.user.isApproved) {
        toast.info("Your doctor profile is awaiting admin approval. Please login again once approved.");
        navigate("/login");
        return;
      }

      if (data.user.role === "patient") navigate("/patient");
      if (data.user.role === "doctor") navigate("/doctor");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl card animate-rise p-6">
      <h1 className="font-heading text-2xl font-bold text-ink">Create Account</h1>
      <p className="mt-1 text-sm text-slate-600">Choose a role and join the appointment portal.</p>

      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input className="input" name="name" value={form.name} onChange={onChange} required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            className="input"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            minLength={6}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
          <select className="input" name="role" value={form.role} onChange={onChange}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        {form.role === "doctor" && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Specialization</label>
              <input className="input" name="specialization" value={form.specialization} onChange={onChange} required />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Experience (years)</label>
              <input
                className="input"
                type="number"
                min="0"
                name="experienceYears"
                value={form.experienceYears}
                onChange={onChange}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
              <textarea className="input min-h-28" name="bio" value={form.bio} onChange={onChange} />
            </div>
          </>
        )}

        {error && <p className="sm:col-span-2 text-sm font-medium text-rose-600">{error}</p>}

        <button type="submit" className="btn-primary sm:col-span-2" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
