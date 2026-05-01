import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout, { useTheme } from "../components/AdminLayout";
import "../styles/timetable.css";
import { FaSun, FaMoon, FaPlus, FaUpload } from "react-icons/fa";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ROWS_PER_PAGE = 10;
import { API_BASE_URL } from "../api/config";

const API_BASE_URL_LOCAL = `${API_BASE_URL}`;

export default function TimetablePage() {
  const [day, setDay] = useState("Monday");
  const [timetable, setTimetable] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // filters
  const [filters, setFilters] = useState({
    department: "",
    year: "",
    division: "",
    batch: ""
  });

  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    years: [],
    divisions: [],
    batches: []
  });

  const [tempFilters, setTempFilters] = useState({
  department: "",
  year: "",
  division: "",
  batch: ""
});

  // add modal
  const [newEntry, setNewEntry] = useState({
    department: "",
    year: "",
    division: "",
    batch: "",
    subject: "",
    teacher_id: "",
    start_time: "",
    end_time: "",
    type: "Lecture"
  });

  const [showAddModal, setShowAddModal] = useState(false);
  // edit
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  // csv
  const [file, setFile] = useState(null);

  // Theme State
  const { darkMode, toggleTheme } = useTheme();

  // =====================================================
  // LOAD TIMETABLE
  // =====================================================
  const loadTimetable = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/timetable`, {
        params: {
          day_of_week: day,
          ...filters
        }
      });
      setTimetable(res.data || []);
      setCurrentPage(1);
    } catch {
      alert("Failed to load timetable");
    }
  };

  // =====================================================
  // LOAD FILTER OPTIONS
  // =====================================================
  const loadFilters = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/timetable/filters`,
        { params: tempFilters  }
      );
      setFilterOptions(res.data);
    } catch {
      alert("Failed to load filters");
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [day, filters]);

  useEffect(() => {
    loadFilters();
  }, [tempFilters.department, tempFilters.year, tempFilters.division]);

  // =====================================================
  // PAGINATION
  // =====================================================
  const totalPages = Math.ceil(timetable.length / ROWS_PER_PAGE);
  const paginatedData = timetable.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  // =====================================================
  // ADD SINGLE ENTRY (FormData ❗)
  // =====================================================
  const handleAddSingle = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("department", newEntry.department);
    fd.append("year", newEntry.year);
    fd.append("division", newEntry.division);
    fd.append("subject", newEntry.subject);
    fd.append("teacher_id", newEntry.teacher_id);
    fd.append("day_of_week", day);
    fd.append("start_time", newEntry.start_time);
    fd.append("end_time", newEntry.end_time);
    fd.append("type", newEntry.type);
    if (newEntry.batch) fd.append("batch", newEntry.batch);

    try {
      await axios.post(`${API_BASE_URL}/admin/timetable/add`, fd);
      alert("Timetable entry added");
      loadTimetable();
      setShowAddModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || "Add failed");
    }
  };

  const handleFilterChange = (e) => {
  setTempFilters({ ...tempFilters, [e.target.name]: e.target.value });
};

  // =====================================================
  // UPDATE ENTRY (FormData ❗)
  // =====================================================
  const handleUpdate = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(editData).forEach(([k, v]) => {
      if (v !== null) fd.append(k, v);
    });

    try {
      await axios.put(
        `${API_BASE_URL}/admin/timetable/update/${editData.timetable_id}`,
        fd
      );
      alert("Updated successfully");
      setShowEdit(false);
      loadTimetable();
    } catch (err) {
      alert(err.response?.data?.detail || "Update failed");
    }
  };
  
  // Delete
  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this entry?")) return;

  try {
    await axios.delete(
      `${API_BASE_URL}/admin/timetable/delete/${id}`
    );
    alert("Timetable entry deleted");
    loadTimetable();
  } catch (err) {
    alert(err.response?.data?.detail || "Delete failed");
  }
};

// =====================================================
// OPEN EDIT MODAL
// =====================================================
const openEdit = (row) => {
  setEditData({
    ...row
  });
  setShowEdit(true);
};


  // =====================================================
  // CSV UPLOAD
  // =====================================================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select CSV file");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/timetable/upload`,
        fd
      );
      alert(`Added: ${res.data.added}, Skipped: ${res.data.skipped}`);
      loadTimetable();
    } catch {
      alert("CSV upload failed");
    }
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <AdminLayout>
      <div className="timetable-root">
      <header className="topbar">
        <h1>Timetable Management</h1>
        <button className="btn primary" onClick={() => setShowAddModal(true)} style={{ marginLeft: "auto", marginRight: "16px" }}>
          <FaPlus style={{ marginRight: "8px" }} /> Add Entry
        </button>
        <div className={`theme-toggle-switch ${darkMode ? "dark" : "light"}`} onClick={toggleTheme}>
          <div className="toggle-circle">{darkMode ? <FaMoon /> : <FaSun />}</div>
        </div>
      </header>

      {/* DAYS */}
      <div className="tt-days">
        {DAYS.map((d) => (
          <button
            key={d}
            className={day === d ? "active" : ""}
            onClick={() => setDay(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
<div className="tt-filters">

  <select name="department" value={tempFilters.department} onChange={handleFilterChange}>
    <option value="">All Departments</option>
    {filterOptions.departments.map((d) => (
      <option key={d} value={d}>{d}</option>
    ))}
  </select>

  <select name="year" value={tempFilters.year} onChange={handleFilterChange}>
    <option value="">All Years</option>
    {filterOptions.years.map((y) => (
      <option key={y} value={y}>{y}</option>
    ))}
  </select>

  <select name="division" value={tempFilters.division} onChange={handleFilterChange}>
    <option value="">All Divisions</option>
    {filterOptions.divisions.map((d) => (
      <option key={d} value={d}>{d}</option>
    ))}
  </select>

  <select name="batch" value={tempFilters.batch} onChange={handleFilterChange}>
    <option value="">All Batches</option>
    {filterOptions.batches.map((b) => (
      <option key={b} value={b}>{b}</option>
    ))}
  </select>

  <button className="btn primary" onClick={() => setFilters(tempFilters)}>
    Apply
  </button>

  <button
    className="btn outline"
    onClick={() => {
      const empty = {
        department: "",
        year: "",
        division: "",
        batch: ""
      };
      setTempFilters(empty);
      setFilters(empty);
    }}
  >
    Clear
  </button>

</div>

      {/* TABLE */}
      <div className="tt-card">
        <table className="tt-table">
          <thead>
            <tr>
              <th>Dept</th>
              <th>Year</th>
              <th>Div</th>
              <th>Batch</th>
              <th>Type</th>
              <th>Time</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                  No record found
                </td>
              </tr>
            ) : (
              paginatedData.map((t) => (
                <tr key={t.timetable_id}>
                  <td>{t.department}</td>
                  <td>{t.year}</td>
                  <td>{t.division}</td>
                  <td>{t.batch || "-"}</td>
                  <td>{t.type}</td>
                  <td>{t.start_time} - {t.end_time}</td>
                  <td>{t.subject}</td>
                  <td>{t.teacher_id}</td>

                  <td>
                    <button className="btn" onClick={() => openEdit(t)}>
                      Edit
                    </button>
                  </td>

                  <td>
                    <button
                      className="btn danger"
                      onClick={() => handleDelete(t.timetable_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            <span>{currentPage} / {totalPages}</span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="section-title">Add Timetable Entry</h3>
            <form onSubmit={handleAddSingle}>
              <div className="form-grid">
                <input placeholder="Dept" onChange={e=>setNewEntry({...newEntry,department:e.target.value})} required />
                <input placeholder="Year" onChange={e=>setNewEntry({...newEntry,year:e.target.value})} required />
                <input placeholder="Division" onChange={e=>setNewEntry({...newEntry,division:e.target.value})} required />
                <input placeholder="Batch (optional)" onChange={e=>setNewEntry({...newEntry,batch:e.target.value})}/>
                <input placeholder="Subject" onChange={e=>setNewEntry({...newEntry,subject:e.target.value})} required />
                <input placeholder="Teacher ID" onChange={e=>setNewEntry({...newEntry,teacher_id:e.target.value})} required />
                <div className="time-input-group">
                  <label className="time-input-label">Start Time</label>
                  <input type="time" onChange={e=>setNewEntry({...newEntry,start_time:e.target.value})} required />
                </div>
                <div className="time-input-group">
                  <label className="time-input-label">End Time</label>
                  <input type="time" onChange={e=>setNewEntry({...newEntry,end_time:e.target.value})} required />
                </div>
                <select onChange={e=>setNewEntry({...newEntry,type:e.target.value})}>
                  <option>Lecture</option>
                  <option>Practical</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn primary">Add Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV */}
      <div className="upload-section">
        <h3 className="section-title">Upload CSV File</h3>
        <form onSubmit={handleUpload}>
          <input type="file" accept=".csv" onChange={e=>setFile(e.target.files[0])} required />
          <button className="btn primary">
            <FaUpload style={{ marginRight: "8px" }} /> Upload
          </button>
        </form>
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="modal">
          <div className="modal-content">
          <h3 className="section-title">Edit Entry</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-grid">
              <input placeholder="Subject" value={editData.subject} onChange={e=>setEditData({...editData,subject:e.target.value})}/>
              <input placeholder="Teacher ID" value={editData.teacher_id} onChange={e=>setEditData({...editData,teacher_id:e.target.value})}/>
              <input type="time" value={editData.start_time} onChange={e=>setEditData({...editData,start_time:e.target.value})}/>
              <input type="time" value={editData.end_time} onChange={e=>setEditData({...editData,end_time:e.target.value})}/>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button type="button" className="btn outline" onClick={()=>setShowEdit(false)}>Cancel</button>
              <button type="submit" className="btn primary">Update</button>
            </div>
          </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
