import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/settings.css";
import AdminLayout from "../components/AdminLayout";
import { FaSave, FaLock, FaUser, FaKey, FaTrash } from "react-icons/fa";

function SettingsPage() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load admin profile
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/admin/profile")
      .then((res) => {
        setUsername(res.data.username);
        setRole(res.data.role);
      })
      .catch(() => {
        setError("Failed to load admin profile");
      });
  }, []);

  const handleUpdate = async () => {
    setMessage("");
    setError("");

    if (!username || !oldPassword || !newPassword) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        "http://127.0.0.1:8000/admin/update-profile",
        {
          username: username,
          old_password: oldPassword,
          new_password: newPassword,
        }
      );

      setMessage(res.data.message);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.detail || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const adminInitial = username ? username.charAt(0).toUpperCase() : "A";

  return (
    <AdminLayout>
      <div className="settings-page">

        {/* Page Topbar */}
        <div className="settings-topbar">
          <div>
            <h1>Settings</h1>
            <div className="page-breadcrumb">
              🏛️ Home <span>›</span> <span>Settings</span>
            </div>
          </div>
        </div>

        <div className="settings-grid">

          {/* ===== Profile Card ===== */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">👤</div>
              <div>
                <h3 className="settings-card-title">Admin Profile</h3>
                <p className="settings-card-subtitle">View and update your account</p>
              </div>
            </div>

            {/* Avatar */}
            <div className="settings-profile">
              <div className="settings-avatar">{adminInitial}</div>
              <h2 className="settings-profile-name">{username || "Admin"}</h2>
              <span className="settings-role">{role || "Administrator"}</span>
            </div>

            {/* Username field */}
            <div className="settings-form-group">
              <label htmlFor="settings-username">Username</label>
              <input
                id="settings-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
          </div>

          {/* ===== Change Password Card ===== */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">🔒</div>
              <div>
                <h3 className="settings-card-title">Change Password</h3>
                <p className="settings-card-subtitle">Update your administrator password</p>
              </div>
            </div>

            <div className="settings-form-group">
              <label htmlFor="old-password">Current Password</label>
              <input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="settings-form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <button
              className="settings-btn"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Saving..." : <><FaSave style={{ marginRight: 8 }} /> Save Changes</>}
            </button>

            {message && (
              <div className="settings-success">
                ✅ {message}
              </div>
            )}
            {error && (
              <div className="settings-error">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* ===== Danger Zone Card ===== */}
          <div className="settings-card danger-zone">
            <div className="settings-card-header">
              <div className="settings-card-icon">⚠️</div>
              <div>
                <h3 className="settings-card-title">Danger Zone</h3>
                <p className="settings-card-subtitle">Irreversible administrative actions</p>
              </div>
            </div>
            <p className="danger-zone-desc">
              These actions are permanent and cannot be undone. Please proceed with caution.
            </p>
            <button className="settings-btn danger">
              <FaTrash style={{ marginRight: 8 }} /> Clear All Session Data
            </button>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

export default SettingsPage;
