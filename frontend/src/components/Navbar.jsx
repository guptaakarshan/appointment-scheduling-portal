import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkStyles = (isActive) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-brand-100 text-brand-700" : "text-slate-600 hover:bg-slate-100"
  }`;

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const roleLinks = {
    patient: [{ to: "/patient", label: "Patient Dashboard" }],
    doctor: [{ to: "/doctor", label: "Doctor Dashboard" }],
    admin: [{ to: "/admin", label: "Admin Dashboard" }],
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="font-heading text-xl font-bold text-brand-700">
          CareSlot Portal
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/" className={linkStyles(location.pathname === "/")}>
            Home
          </Link>

          <Link to="/doctors" className={linkStyles(location.pathname.startsWith("/doctors"))}>
            Doctors
          </Link>

          {isAuthenticated &&
            roleLinks[user.role]?.map((item) => (
              <Link key={item.to} to={item.to} className={linkStyles(location.pathname.startsWith(item.to))}>
                {item.label}
              </Link>
            ))}

          {isAuthenticated ? (
            <button type="button" onClick={logout} className="btn-ghost">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/login" className="btn-ghost">
                Admin
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
