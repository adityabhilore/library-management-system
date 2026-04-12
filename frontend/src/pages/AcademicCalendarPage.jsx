import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout, { useTheme } from "../components/AdminLayout";
import "../styles/academicCalendar.css";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaUpload, FaSun, FaMoon } from "react-icons/fa";

const API_URL = "https://library-management-system-fsn2.onrender.com/academic-calendar";
const PAGE_SIZE = 10;

export default function AcademicCalendarPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // single add form
  const [newEntry, setNewEntry] = useState({
    date: "",
    event_type: "Holiday",
    description: "",
  });

  // edit modal (LIKE TIMETABLE)
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    event_id: null,
    date: "",
    event_type: "",
    description: "",
  });

  // filters
  const [filterDate, setFilterDate] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDescription, setFilterDescription] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Theme State
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(API_URL);
      setEvents(res.data);
      setFilteredEvents(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch events");
    }
  };

  /* ================= ADD SINGLE EVENT ================= */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEntry.date || !newEntry.event_type || !newEntry.description) {
      alert("All fields are required");
      return;
    }

    try {
      await axios.post(API_URL, newEntry);
      setNewEntry({ date: "", event_type: "Holiday", description: "" });
      setShowAddModal(false);
      fetchEvents();
      alert("Event added successfully");
    } catch {
      alert("Failed to add event");
    }
  };

  /* ================= EDIT (LIKE TIMETABLE) ================= */
  const openEdit = (row) => {
    setEditData({ ...row });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API_URL}/${editData.event_id}`, {
        date: editData.date,
        event_type: editData.event_type,
        description: editData.description,
      });
      alert("Event updated successfully");
      setShowEdit(false);
      fetchEvents();
    } catch {
      alert("Update failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    await axios.delete(`${API_URL}/${id}`);
    fetchEvents();
  };

  /* ================= FILTER ================= */
  const applyFilters = () => {
    let data = [...events];

    if (filterDate) data = data.filter(e => e.date === filterDate);
    if (filterType) data = data.filter(e => e.event_type === filterType);
    if (filterDescription)
      data = data.filter(e =>
        e.description.toLowerCase().includes(filterDescription.toLowerCase())
      );

    setFilteredEvents(data);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterDate("");
    setFilterType("");
    setFilterDescription("");
    setFilteredEvents(events);
    setCurrentPage(1);
  };

  /* ================= CSV UPLOAD ================= */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return alert("Select CSV file");

    const text = await csvFile.text();
    const rows = text.split("\n").slice(1);

    const eventsToUpload = rows
      .map((row) => {
        const [date, event_type, description] = row.split(",");
        if (!date || !event_type || !description) return null;
        return {
          date: date.trim(),
          event_type: event_type.trim(),
          description: description.trim(),
        };
      })
      .filter(Boolean);

    if (eventsToUpload.length === 0)
      return alert("No valid rows found");

    await axios.post(`${API_URL}/bulk`, eventsToUpload);
    alert("CSV uploaded successfully");
    fetchEvents();
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  return (
    <AdminLayout>
      <div className="calendar-root">
        <header className="topbar">
          <h1>Academic Calendar</h1>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginLeft: "auto" }}>
            <button className="btn primary" onClick={() => setShowAddModal(true)}>
              <FaPlus style={{ marginRight: "8px" }} /> Add Event
            </button>
            <div className={`theme-toggle-switch ${darkMode ? "dark" : "light"}`} onClick={toggleTheme}>
              <div className="toggle-circle">{darkMode ? <FaMoon /> : <FaSun />}</div>
            </div>
          </div>
        </header>

        {/* FILTER + TABLE */}
        <div className="calendar-card">
          <div className="calendar-filters" style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
            <div className="search-wrapper" style={{ position: "relative", flex: 1 }}>
              <FaSearch className="search-icon" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search description..."
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
                style={{ paddingLeft: "36px", width: "100%" }}
              />
            </div>

            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="Holiday">Holiday</option>
              <option value="Event">Event</option>
              <option value="Exam">Exam</option>
            </select>

            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)} 
            />

            <button className="btn" onClick={applyFilters}>
              <FaFilter style={{ marginRight: "6px" }} /> Apply
            </button>
            <button className="btn outline" onClick={clearFilters}>
              Clear
            </button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="center">No events found</td>
                </tr>
              ) : (
                paginatedEvents.map((e) => (
                  <tr key={e.event_id}>
                    <td>{e.date}</td>
                    <td>
                      <span className={`badge ${e.event_type.toLowerCase()}`} style={{ padding: "4px 8px", borderRadius: "4px", background: "var(--bg-secondary)", fontSize: "0.85rem" }}>
                        {e.event_type}
                      </span>
                    </td>
                    <td>{e.description}</td>
                    <td>
                      <button className="btn icon-btn" onClick={() => openEdit(e)} title="Edit" style={{ marginRight: "8px" }}>
                        <FaEdit />
                      </button>
                      <button className="btn icon-btn danger" onClick={() => handleDelete(e.event_id)} title="Delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </div>

      {/* CSV UPLOAD */}
      <div className="upload-section">
        <h3 className="section-title">Upload CSV</h3>
        <form onSubmit={handleUpload} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} required />
          <button className="btn primary">
            <FaUpload style={{ marginRight: "8px" }} /> Upload
          </button>
        </form>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="section-title">Add New Event</h3>
            <form onSubmit={handleAdd}>
              <div className="form-grid">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label className="text-muted" style={{ fontSize: "12px", marginBottom: "4px" }}>Date</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label className="text-muted" style={{ fontSize: "12px", marginBottom: "4px" }}>Type</label>
                  <select
                    value={newEntry.event_type}
                    onChange={(e) => setNewEntry({ ...newEntry, event_type: e.target.value })}
                  >
                    <option value="Holiday">Holiday</option>
                    <option value="Event">Event</option>
                    <option value="Exam">Exam</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gridColumn: "1 / -1" }}>
                  <label className="text-muted" style={{ fontSize: "12px", marginBottom: "4px" }}>Description</label>
                  <input
                    placeholder="Event Description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="section-title">Edit Event</h3>
            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  required
                />
                <select
                  value={editData.event_type}
                  onChange={(e) => setEditData({ ...editData, event_type: e.target.value })}
                >
                  <option value="Holiday">Holiday</option>
                  <option value="Event">Event</option>
                  <option value="Exam">Exam</option>
                </select>
                <input
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  required
                  style={{ gridColumn: "1 / -1" }}
                />
              </div>
              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn outline" onClick={() => setShowEdit(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
