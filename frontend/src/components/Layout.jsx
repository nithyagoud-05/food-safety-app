import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Restaurants", to: "/restaurants" },
  { label: "Report", to: "/report" },
  { label: "Admin", to: "/admin", roles: ["admin"] }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-forest">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            Annapurna
          </Link>
          <div className="flex flex-wrap items-center gap-1">
            {navItems
              .filter((item) => !item.roles || item.roles.includes(user?.role))
              .map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-mint text-forest" : "text-gray-600 hover:bg-gray-100 hover:text-ink"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/profile" className="btn-secondary px-3" title="Profile">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button className="btn-secondary px-3" onClick={handleLogout} title="Logout">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
