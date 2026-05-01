import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import "../styles/adminLayout.css";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaUsers,
  FaTable,
  FaCalendarAlt,
  FaCogs,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaMoon,
  FaQrcode,
} from "react-icons/fa";
import logo from "../assets/image.png";

// ---- Shared Theme Hook (default = light/gov mode) ----
export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(false); // default: light

  useEffect(() => {
    const syncTheme = () => {
      const saved = localStorage.getItem("theme");
      const isDark = saved === "dark";
      setDarkMode(isDark);
      document.body.classList.toggle("dark-mode", isDark);
      // Ensure we NEVER have "light-mode" class conflicts
      document.body.classList.remove("light-mode");
    };

    syncTheme();
    window.addEventListener("theme-change", syncTheme);
    return () => window.removeEventListener("theme-change", syncTheme);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    localStorage.setItem("theme", newMode ? "dark" : "light");
    window.dispatchEvent(new Event("theme-change"));
  };

  return { darkMode, toggleTheme };
};

// ---- Helper: get admin username initial ----
const getAdminInfo = () => {
  try {
    const data = JSON.parse(localStorage.getItem("admin") || "{}");
    const name = data.username || data.name || "Admin";
    return { name, initial: name.charAt(0).toUpperCase() };
  } catch {
    return { name: "Admin", initial: "A" };
  }
};

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const admin = getAdminInfo();

  // Auth guard
  useEffect(() => {
    const stored = localStorage.getItem("admin");
    if (!stored) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  // Trigger chart resize after sidebar transition
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 360);
    return () => clearTimeout(timer);
  }, [collapsed]);

  const isActive = (path) => location.pathname === path;

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-root">
      {/* =================== HAMBURGER (mobile only) =================== */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* =================== OVERLAY (mobile only) =================== */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* =================== SIDEBAR =================== */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>

        {/* Brand Header */}
        <div className="brand">
          {!collapsed && (
            <div className="brand-left">
              <img src={logo} alt="Library Logo" className="logo" />
              <div>
                <div className="brand-title">LibAdmin</div>
                <div className="brand-subtitle-text">Management Portal</div>
              </div>
            </div>
          )}
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">

          {/* === MAIN MENU === */}
          {!collapsed && <div className="nav-section-label">Main Menu</div>}
          <nav>
            <ul>
              <li
                onClick={() => navigate("/admin/dashboard")}
                className={isActive("/admin/dashboard") ? "active" : ""}
                title="Dashboard"
              >
                <FaTachometerAlt className="nav-icon" />
                {!collapsed && <span>Dashboard</span>}
              </li>

              <li
                onClick={() => navigate("/admin/logs")}
                className={isActive("/admin/logs") ? "active" : ""}
                title="Logs"
              >
                <FaClipboardList className="nav-icon" />
                {!collapsed && <span>Logs</span>}
              </li>
            </ul>
          </nav>

          {/* === MANAGEMENT === */}
          {!collapsed && <div className="nav-section-label">Management</div>}
          <nav>
            <ul>
              <li
                onClick={() => navigate("/admin/members")}
                className={isActive("/admin/members") ? "active" : ""}
                title="Members"
              >
                <FaUsers className="nav-icon" />
                {!collapsed && <span>Members</span>}
              </li>

              <li
                onClick={() => navigate("/admin/timetable")}
                className={isActive("/admin/timetable") ? "active" : ""}
                title="Timetable"
              >
                <FaTable className="nav-icon" />
                {!collapsed && <span>Timetable</span>}
              </li>

              <li
                onClick={() => navigate("/scan")}
                className={isActive("/scan") ? "active" : ""}
                title="Scan"
              >
                <FaQrcode className="nav-icon" />
                {!collapsed && <span>QR Scan</span>}
              </li>

              <li
                onClick={() => navigate("/admin/academic-calendar")}
                className={isActive("/admin/academic-calendar") ? "active" : ""}
                title="Academic Calendar"
              >
                <FaCalendarAlt className="nav-icon" />
                {!collapsed && <span>Academic Calendar</span>}
              </li>
            </ul>
          </nav>

          {/* === SYSTEM === */}
          {!collapsed && <div className="nav-section-label">System</div>}
          <nav>
            <ul>
              <li
                onClick={() => navigate("/settings")}
                className={isActive("/settings") ? "active" : ""}
                title="Settings"
              >
                <FaCogs className="nav-icon" />
                {!collapsed && <span>Settings</span>}
              </li>

              {/* Separator */}
              <div className="nav-separator" />

              <li
                onClick={() => navigate("/logout")}
                className="logout-item"
                title="Logout"
              >
                <FaSignOutAlt className="nav-icon" />
                {!collapsed && <span>Logout</span>}
              </li>
            </ul>
          </nav>
        </div>

        {/* Footer: Admin badge + theme toggle */}
        <div className="sidebar-footer">
          {/* Admin user badge */}
          <div className="admin-badge">
            <div className="admin-avatar">{admin.initial}</div>
            {!collapsed && (
              <div className="admin-info">
                <div className="admin-name">{admin.name}</div>
                <div className="admin-role">Administrator</div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            className="theme-toggle-btn-sidebar"
            onClick={toggleTheme}
            title="Toggle Theme"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            {!collapsed && (
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            )}
          </button>
        </div>
      </aside>

      {/* =================== MAIN CONTENT =================== */}
      <main className={`main-area ${collapsed ? "collapsed-offset" : ""}`}>
        {children}
      </main>
    </div>
  );
}
