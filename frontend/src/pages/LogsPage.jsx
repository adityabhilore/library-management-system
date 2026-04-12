import React, { useEffect, useState } from "react";
import axios from "axios";
import ManualEntryModal from "../components/ManualEntryModal";
import "../styles/logs.css";
import AdminLayout from "../components/AdminLayout";
import { FaFileExport, FaSearch, FaFilter, FaPlus, FaEraser, FaSun, FaMoon, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";


function LogsPage() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: "",
    role: "",
    action: "",
    department: "",
    dateFrom: "",
    dateTo: "",
  });
const [departments, setDepartments] = useState([]);
const [years, setYears] = useState([]);
const [divisions, setDivisions] = useState([]);
const [batches, setBatches] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);

  // Theme State
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") !== "light";
    setDarkMode(isDark);
    document.body.classList.toggle("light-mode", !isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.body.classList.toggle("light-mode", !newMode);
  };

  const fetchLogs = async (p = 1, filtersToUse = filters) => {
  setLoading(true);
  try {
    // Build params
    const params = {
      page: p,
      page_size: pageSize,
      role: filtersToUse.role || undefined,
      action: filtersToUse.action || undefined,
      year: filtersToUse.year || undefined,
      division: filtersToUse.division || undefined,
      batch: filtersToUse.batch || undefined,
      dateFrom: filtersToUse.dateFrom || undefined,
      dateTo: filtersToUse.dateTo || undefined,
    };

    // Handle search - try to match it as a department first, then as user_id
    if (filtersToUse.q) {
      params.department = filtersToUse.q; // Search in department field
    }
    
    // Add explicit department filter if selected (overrides search)
    if (filtersToUse.department && filtersToUse.department !== "") {
      params.department = filtersToUse.department;
    }

    const res = await axios.get("https://library-management-system-fsn2.onrender.com/admin/logs", { params });

    // 🔁 map backend response → UI expected structure
    const mappedLogs = (res.data.data || []).map((log) => {
    const date = new Date(log.scan_time);
    const formattedDate =
      date.getDate().toString().padStart(2, "0") + "-" +
      (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
      date.getFullYear() + " " +
      date.toLocaleTimeString();

    return {
      log_id: log.log_id,
      user_id: log.user_id,
      name: log.name,
      role: log.role,
      department: log.department,
      action: log.action,
      timestamp: formattedDate,
      status:
        log.status === "SKIP"
          ? `${log.matched_subject || "Class"} Skipped`
          : "Normal",
    };
  });

    setLogs(mappedLogs);
    setTotalPages(res.data.total_pages || 1);
    setPage(p);
  } catch (err) {
    console.error("Error fetching logs:", err);
  }
  setLoading(false);
};


  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleFilterChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    fetchLogs(1, newFilters); // Auto-search with new filter
  };


  const clearFilters = () => {
    const clearedFilters = {
      q: "",
      role: "",
      action: "",
      department: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(clearedFilters);
    fetchLogs(1, clearedFilters); // Auto-search with cleared filters
  };

  const fetchDepartments = async () => {
  try {
    const res = await axios.get("https://library-management-system-fsn2.onrender.com/admin/logs/departments");
    setDepartments(res.data || []);
  } catch (err) {
    console.error("Failed to load departments");
  }
};
useEffect(() => {
  fetchLogs(1);
  fetchDepartments();
}, []);

useEffect(() => {
  const fetchDepartments = async () => {
    const res = await axios.get(
      "https://library-management-system-fsn2.onrender.com/admin/logs/departments/by-role",
      { params: { role: filters.role } }
    );
    setDepartments(res.data || []);
  };

  fetchDepartments();
}, [filters.role]);

useEffect(() => {
  axios
    .get("https://library-management-system-Isn2.onrender.com/admin/logs/students/meta")
    .then((res) => {
      setYears(res.data.years || []);
      setDivisions(res.data.divisions || []);
      setBatches(res.data.batches || []);
    });
}, []);


const exportLogs = async () => {
  try {
    const params = {
      action: filters.action || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    };

    // Handle search in department
    if (filters.q) {
      params.department = filters.q; // Search in department field
    }
    
    // Add explicit department filter if selected
    if (filters.department && filters.department !== "") {
      params.department = filters.department;
    }

    const res = await axios.get(
      "https://library-management-system-Isn2.onrender.com/admin/logs/export",
      {
        params,
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "logs_report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("Export failed", err);
  }
};



  return (
    <AdminLayout>
    <div className="logs-root">

      <header className="topbar">
        <h1>Logs Management</h1>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button className="btn primary" onClick={() => setShowModal(true)}>
            <FaPlus style={{ marginRight: "8px" }} /> Manual Entry
          </button>
          <div className={`theme-toggle-switch ${darkMode ? "dark" : "light"}`} onClick={toggleTheme}>
            <div className="toggle-circle">{darkMode ? <FaMoon /> : <FaSun />}</div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="logs-filters">
        <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              name="q"
              className="search-input"
              placeholder="Search user ID, name, remarks..."
              value={filters.q}
              onChange={handleFilterChange}
            />
        </div>

          <select name="role" value={filters.role} onChange={handleFilterChange}>
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <select name="action" value={filters.action} onChange={handleFilterChange}>
            <option value="">All Actions</option>
            <option value="entry">Entry</option>
            <option value="exit">Exit</option>
          </select>

          <select name="department" value={filters.department} onChange={handleFilterChange}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {filters.role === "student" && (
            <>
              <select name="year" onChange={handleFilterChange}>
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select name="division" onChange={handleFilterChange}>
                <option value="">All Divisions</option>
                {divisions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <select name="batch" onChange={handleFilterChange}>
                <option value="">All Batches</option>
                {batches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </>
          )}

          <div className="date-group">
            <span className="text-muted">From:</span>
            <input name="dateFrom" type="date" value={filters.dateFrom} onChange={handleFilterChange} />
            <span className="text-muted">To:</span>
            <input name="dateTo" type="date" value={filters.dateTo} onChange={handleFilterChange} />
          </div>

          <div className="button-group">
            <button className="btn" onClick={() => fetchLogs(1)}>
              <FaFilter style={{ marginRight: "6px" }} /> Apply
            </button>
            <button className="btn outline" onClick={clearFilters}>
              <FaEraser style={{ marginRight: "6px" }} /> Clear
            </button>
            <button className="btn outline" onClick={exportLogs}>
              <FaFileExport style={{ marginRight: "6px" }} /> Export
            </button>
          </div>
      </div>

      {/* Logs Table */}
      <div className="logs-card">
        {loading ? (
          <p className="center">Loading logs...</p>
        ) : (
          <>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Dept</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="center">No logs found</td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <tr key={log.log_id} className={`log-row log-${log.action.toLowerCase()}`}>
                      <td>{(page - 1) * pageSize + (i + 1)}</td>
                      <td>{log.user_id}</td>
                      <td>{log.name || "-"}</td>
                      <td><span className={`role-badge role-${log.role.toLowerCase()}`}>{log.role}</span></td>
                      <td>{log.department || "-"}</td>
                      <td>
                        <span className={`action-badge action-${log.action.toLowerCase()}`}>
                          {log.action === "entry" && <FaCheckCircle />}
                          {log.action === "exit" && <FaTimesCircle />}
                          {log.action !== "entry" && log.action !== "exit" && <FaExclamationCircle />}
                          {log.action}
                        </span>
                      </td>
                      <td><span className={`status-badge status-${log.status.toLowerCase().replace(/\s+/g, '-')}`}>{log.status}</span></td>
                      <td className="timestamp">{log.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="logs-pagination">
              <button disabled={page === 1} onClick={() => fetchLogs(1)}>First</button>
              <button disabled={page === 1} onClick={() => fetchLogs(page - 1)}>Prev</button>

              <span>Page {page} of {totalPages}</span>

              <button disabled={page === totalPages} onClick={() => fetchLogs(page + 1)}>Next</button>
              <button disabled={page === totalPages} onClick={() => fetchLogs(totalPages)}>Last</button>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <ManualEntryModal
          onClose={() => setShowModal(false)}
          onSaved={() => fetchLogs(page)}
        />
      )}
    </div>
    </AdminLayout>
  );
}

export default LogsPage;
