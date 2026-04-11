import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Inline styles to avoid any CSS dependency during logout
const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    background: "#f0f4f8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #cdd5df",
    borderRadius: "16px",
    padding: "52px 48px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    maxWidth: "380px",
    width: "90%",
    animation: "fadeIn 0.4s ease",
  },
  seal: {
    fontSize: "52px",
    marginBottom: "20px",
    display: "block",
  },
  h2: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a3c6e",
    margin: "0 0 8px 0",
  },
  sub: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 28px 0",
  },
  spinnerWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#4a5568",
    fontSize: "14px",
    fontWeight: "500",
  },
  spinner: {
    width: "22px",
    height: "22px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#1a3c6e",
    borderRadius: "50%",
    animation: "spin 0.75s linear infinite",
    display: "inline-block",
    flexShrink: 0,
  },
  footer: {
    marginTop: "48px",
    fontSize: "12px",
    color: "#94a3b8",
  },
};

// Inject keyframes once
const injectKeyframes = () => {
  if (document.getElementById("logout-kf")) return;
  const style = document.createElement("style");
  style.id = "logout-kf";
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(style);
};

export default function Logout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = signing out, 1 = done

  useEffect(() => {
    injectKeyframes();

    // Step 1: brief "Signing out..." splash
    const t1 = setTimeout(() => {
      setStep(1);
    }, 900);

    // Step 2: clear storage and redirect
    const t2 = setTimeout(() => {
      localStorage.removeItem("admin");
      navigate("/admin/login", { replace: true });
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <span style={styles.seal}>🏛️</span>
        <h2 style={styles.h2}>
          {step === 0 ? "Signing Out..." : "See you soon!"}
        </h2>
        <p style={styles.sub}>
          {step === 0
            ? "Please wait while we securely end your session."
            : "You have been signed out successfully."}
        </p>

        <div style={styles.spinnerWrap}>
          <span style={styles.spinner}></span>
          <span>
            {step === 0 ? "Clearing session data..." : "Redirecting to login..."}
          </span>
        </div>
      </div>

      <div style={styles.footer}>
        Library Management System &nbsp;|&nbsp; Admin Portal
      </div>
    </div>
  );
}
