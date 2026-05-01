import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";
import {
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaChartBar,
  FaUsers,
  FaBook,
  FaCheckCircle,
} from "react-icons/fa";
import logo from "../assets/image.png";
import "../styles/login-new.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    // Limit password to 72 bytes (bcrypt limit)
    const truncated = value.substring(0, 72);
    setPassword(truncated);
    if (value.length > 72) {
      setError("Password is limited to 72 characters");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        username,
        password,
      });

      if (response.data.status === "success") {
        setSuccessMessage("Login successful! Redirecting...");
        localStorage.setItem("admin", JSON.stringify(response.data));
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 800);
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-login-page">
      {/* Background animation */}
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Main container */}
      <div className="login-container">
        {/* Left side - Branding */}
        <div className="login-left-side">
          <div className="login-left-content">
            <div className="login-logo-section">
              <div className="login-logo">
                <img src={logo} alt="Library" className="logo-img" />
              </div>
              <h1>LibAccess</h1>
              <p>Professional Management Portal</p>
            </div>

            <div className="login-features-new">
              <div className="feature-item">
                <div className="feature-icon">
                  <FaChartBar />
                </div>
                <span>Real-time Analytics</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <FaUsers />
                </div>
                <span>Member Management</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <FaCheckCircle />
                </div>
                <span>Attendance Tracking</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <FaBook />
                </div>
                <span>Resource Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="login-right-side">
          <div className="login-form-container">
            <div className="login-form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your admin account</p>
            </div>

            {/* Success message */}
            {successMessage && (
              <div className="login-alert login-alert-success">
                <div className="alert-icon">✓</div>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="login-alert login-alert-error">
                <div className="alert-icon">!</div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="login-form-new">
              {/* Username field */}
              <div className="login-form-group">
                <label>Username</label>
                <div className="login-input-wrapper">
                  <FaUser className="login-input-icon" />
                  <input
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="login-form-group">
                <label>Password</label>
                <div className="login-input-wrapper">
                  <FaLock className="login-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="login-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="login-button-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <FaLock size={16} />
                    Sign In Secure
                  </>
                )}
              </button>
            </form>

            <div className="login-footer-text">
              <p>🔒 Secure access • Admin only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
