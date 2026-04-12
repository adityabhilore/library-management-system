import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft } from "react-icons/fi";
import "../styles/scan.css";

const API_URL = "https://library-management-system-fsn2.onrender.com/scan";

export default function ScanPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [scanValue, setScanValue] = useState("");
  const [message,   setMessage]   = useState("");
  const [status,    setStatus]    = useState(""); // "success" | "error"

  // Keep focus on input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-clear message after 3s
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => { setMessage(""); setStatus(""); }, 3000);
    return () => clearTimeout(t);
  }, [message]);

  const handleKeyDown = async (e) => {
    if (e.key !== "Enter") return;
    const val = scanValue.trim();
    if (!val) return;

    try {
      const res = await axios.post(API_URL, { user_id: val });
      setMessage(res.data.message);
      setStatus("success");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Invalid ID");
      setStatus("error");
    }

    setScanValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="scan-page">
      <div className="scan-card">

        {/* Back Button */}
        <button
          className="scan-back-btn"
          onClick={() => navigate("/admin/dashboard")}
          title="Back to Dashboard"
        >
          <FiArrowLeft size={20} />
          <span>Go to Dashboard</span>
        </button>

        {/* Header */}
        <div className="scan-header">
          <span className="scan-icon">🪪</span>
          <h1 className="scan-title">Library Entry Scan</h1>
          <p className="scan-subtitle">Scan your ID card to record entry or exit</p>
        </div>

        <div className="scan-divider" />

        {/* Input */}
        <div className="scan-input-wrap">
          <input
            ref={inputRef}
            id="scan-input"
            className="scan-input"
            type="text"
            placeholder="Scan or type ID here..."
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
          />
        </div>

        <p className="scan-hint">Press Enter ↵ to submit</p>

        {/* Result */}
        {message && (
          <div className={`scan-message ${status}`}>
            {status === "success" ? "✅" : "❌"} {message}
          </div>
        )}

      </div>

      <p className="scan-footer">Library Management System · Entry / Exit Kiosk</p>
    </div>
  );
}
