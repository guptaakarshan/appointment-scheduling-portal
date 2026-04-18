import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === "patient") navigate("/patient");
      if (data.user.role === "doctor") navigate("/doctor");
      if (data.user.role === "admin") navigate("/admin");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md card animate-rise p-6">
      <h1 className="font-heading text-2xl font-bold text-ink">Welcome Back</h1>
      <p className="mt-1 text-sm text-slate-600">Login to access your appointment dashboard.</p>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className="input" value={form.email} onChange={onChange} required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>

        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        New user?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
