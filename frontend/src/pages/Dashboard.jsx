import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import AdminLayout from "../components/AdminLayout";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart, Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  useMargin,
} from "recharts";

import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSignInAlt,
  FaSignOutAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import "../styles/Dashboard.css";

const COLORS = ["#8b5cf6", "#06b6d4", "#f472b6", "#10b981"];

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [memberPie, setMemberPie] = useState([]);

  const [studentDepartments, setStudentDepartments] = useState([]);
  const [studentYears, setStudentYears] = useState([]);
  const [studentDivisions, setStudentDivisions] = useState([]);
  const [teacherDepartments, setTeacherDepartments] = useState([]);
  const [deptBarData, setDeptBarData] = useState([]);
  const [attendanceLineData, setAttendanceLineData] = useState([]);

  const [memberFilters, setMemberFilters] = useState({
    memberType: "",
    department: "",
    year: "",
    division: "",
  });

  const [lineFilters, setLineFilters] = useState({
    date: new Date().toISOString().split("T")[0], // today
    startHour: 8,
    endHour: 18,
  });

  // Prevent lineFilters effect from firing on initial mount
  const isFirstMount = useRef(true);
  const todayEntryExitData = charts?.today
    ? [{ name: "Today", entry: charts.today.entry, exit: charts.today.exit }]
    : [];

  // ------------------ LOAD PIE ------------------
  const loadMemberChart = async (filters = {}) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/charts/members`,
        { params: filters }
      );
      setMemberPie(res.data?.length ? res.data : [{ name: "No Data", value: 0 }]);
    } catch {
      setMemberPie([{ name: "No Data", value: 0 }]);
    }
  };

  const loadDepartmentBarChart = async (filters = {}) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/admin/charts/department-wise`,
      { params: filters }
    );
    setDeptBarData(res.data);
  } catch (err) {
    console.error("Failed to load bar chart", err);
    setDeptBarData([]);
  }
};

const loadAttendanceTimeline = async (filters = lineFilters) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/admin/charts/attendance-timeline`,
      {
        params: {
          date: filters.date,
          start_hour: filters.startHour,
          end_hour: filters.endHour,
        },
      }
    );
    setAttendanceLineData(res.data);
  } catch (err) {
    console.error("Failed to load attendance timeline", err);
    setAttendanceLineData([]);
  }
};

  // ------------------ APPLY ------------------
  const handleApplyFilters = () => {
    const params = {};

    if (memberFilters.memberType)
      params.member_type = memberFilters.memberType;

    if (memberFilters.department)
      params.department = memberFilters.department;

    if (memberFilters.memberType === "student") {
      if (memberFilters.year) params.year = memberFilters.year;
      if (memberFilters.division) params.division = memberFilters.division;
    }

    loadMemberChart(params);
    loadDepartmentBarChart(params);
  };

  // ------------------ RESET ------------------
  const handleResetFilters = () => {
    setMemberFilters({
      memberType: "",
      department: "",
      year: "",
      division: "",
    });

    setStudentDepartments([]);
    setStudentYears([]);
    setStudentDivisions([]);
    setTeacherDepartments([]);

    loadMemberChart();
    loadDepartmentBarChart();
  };

  

  // ------------------ ALL INITIAL DATA: individual fetches so one failure doesn't block all ------------------
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setErr("");
      try {
        const sRes = await axios.get(`${API_BASE_URL}/admin/summary`);
        setSummary(sRes.data);
      } catch { setSummary(null); }

      try {
        const cRes = await axios.get(`${API_BASE_URL}/admin/stats/charts`);
        setCharts(cRes.data);
      } catch { setCharts(null); }

      try {
        const pieRes = await axios.get(`${API_BASE_URL}/admin/charts/members`);
        setMemberPie(pieRes.data?.length ? pieRes.data : [{ name: "No Data", value: 0 }]);
      } catch { setMemberPie([{ name: "No Data", value: 0 }]); }

      try {
        const barRes = await axios.get(`${API_BASE_URL}/admin/charts/department-wise`);
        setDeptBarData(barRes.data);
      } catch { setDeptBarData([]); }

      try {
        const timelineRes = await axios.get(
          `${API_BASE_URL}/admin/charts/attendance-timeline`,
          { params: { date: lineFilters.date, start_hour: lineFilters.startHour, end_hour: lineFilters.endHour } }
        );
        setAttendanceLineData(timelineRes.data);
      } catch { setAttendanceLineData([]); }

      setLoading(false);
    }
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ------------------ STUDENT DEPARTMENTS ------------------
  useEffect(() => {
    if (memberFilters.memberType === "student") {
      axios
        .get(`${API_BASE_URL}/admin/filters/student/departments`)
        .then(res => setStudentDepartments(res.data));
    }
  }, [memberFilters.memberType]);

  // ------------------ STUDENT YEARS (ALL LOGIC FIXED) ------------------
  useEffect(() => {
    if (memberFilters.memberType === "student") {
      const params = {};
      if (memberFilters.department)
        params.department = memberFilters.department;

      axios
        .get(`${API_BASE_URL}/admin/filters/student/years`, { params })
        .then(res => setStudentYears(res.data));
    } else {
      setStudentYears([]);
    }
  }, [memberFilters.department, memberFilters.memberType]);

  // ------------------ STUDENT DIVISIONS (ALL LOGIC FIXED) ------------------
  useEffect(() => {
    if (memberFilters.memberType === "student") {
      const params = {};
      if (memberFilters.department)
        params.department = memberFilters.department;
      if (memberFilters.year)
        params.year = memberFilters.year;

      axios
        .get(`${API_BASE_URL}/admin/filters/student/divisions`, { params })
        .then(res => setStudentDivisions(res.data));
    } else {
      setStudentDivisions([]);
    }
  }, [memberFilters.department, memberFilters.year, memberFilters.memberType]);

  // ------------------ TEACHER DEPARTMENTS ------------------
  useEffect(() => {
    if (memberFilters.memberType === "teacher") {
      axios
        .get(`${API_BASE_URL}/admin/filters/teacher/departments`)
        .then(res => setTeacherDepartments(res.data));
    }
  }, [memberFilters.memberType]);

useEffect(() => {
  // Skip the very first run — initial data is loaded by fetchAll above
  if (isFirstMount.current) {
    isFirstMount.current = false;
    return;
  }
  loadAttendanceTimeline(lineFilters);
}, [lineFilters]);



  if (loading) return (
    <div className="dashboard-loading">
      <div className="dashboard-spinner" />
      <span className="dashboard-loading-text">Loading dashboard data...</span>
    </div>
  );
  if (err) return (
    <div className="dashboard-error">
      ⚠️ {err}
    </div>
  );

  return (
    <AdminLayout>
      <div className="dashboard-content-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <h1>Dashboard</h1>
            <div className="topbar-breadcrumb">
              🏛️ Home <span>›</span> <span>Dashboard</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-date">
              📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>



           <section className="stats-strip">
               <div className="stat-box blue">
                 <div className="stat-icon"><FaUserGraduate /></div>
                 <div className="stat-info">
                   <h2>{summary?.total_students ?? 0}</h2>
                   <p>Total Students</p>
                 </div>
               </div>

               <div className="stat-box orange">
                 <div className="stat-icon"><FaChalkboardTeacher /></div>
                 <div className="stat-info">
                   <h2>{summary?.total_teachers ?? 0}</h2>
                   <p>Total Teachers</p>
                 </div>
               </div>

               <div className="stat-box green">
                 <div className="stat-icon"><FaSignInAlt /></div>
                 <div className="stat-info">
                   <h2>{summary?.today_entries ?? 0}</h2>
                   <p>Check-in Today</p>
                 </div>
               </div>

               <div className="stat-box red">
                 <div className="stat-icon"><FaSignOutAlt /></div>
                 <div className="stat-info">
                   <h2>{summary?.today_exits ?? 0}</h2>
                   <p>Check-out Today</p>
                 </div>
               </div>

               <div className="stat-box purple">
                 <div className="stat-icon"><FaExclamationTriangle /></div>
                 <div className="stat-info">
                   <h2>{summary?.skipping_alerts ?? 0}</h2>
                   <p>Skipping Alerts</p>
                 </div>
               </div>
             </section>



        {/* ------------------ PIE ------------------ */}
        <section className="charts-grid">
          <div className="panel ">
            <div className="chart-header-row">
              <h3>Members Distribution</h3>
              
              <div className="dashboard-filters-row">
                <select
                  value={memberFilters.memberType}
                  onChange={(e) =>
                    setMemberFilters({
                      memberType: e.target.value,
                      department: "",
                      year: "",
                      division: "",
                    })
                  }
                >
                  <option value="">All Types</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>

                {memberFilters.memberType && (
                  <select
                    value={memberFilters.department}
                    onChange={(e) =>
                      setMemberFilters({ ...memberFilters, department: e.target.value })
                    }
                  >
                    <option value="">All Depts</option>
                    {memberFilters.memberType === "student" &&
                      studentDepartments.map(dep => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    {memberFilters.memberType === "teacher" &&
                      teacherDepartments.map(dep => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                  </select>
                )}

                {memberFilters.memberType === "student" && (
                  <>
                    <select
                      value={memberFilters.year}
                      onChange={(e) =>
                        setMemberFilters({ ...memberFilters, year: e.target.value })
                      }
                    >
                      <option value="">All Years</option>
                      {studentYears.map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>

                    <select
                      value={memberFilters.division}
                      onChange={(e) =>
                        setMemberFilters({ ...memberFilters, division: e.target.value })
                      }
                    >
                      <option value="">All Divs</option>
                      {studentDivisions.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </>
                )}

                <button className="btn small" onClick={handleApplyFilters}>Apply</button>
                <button className="btn small outline" onClick={handleResetFilters}>Reset</button>
              </div>
            </div>

            <div className="chart-area">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={memberPie}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {memberPie.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
               <h3>Entry vs Exit (Today)</h3>
               <ResponsiveContainer width="100%" height={240}>
                 
                 <BarChart data={todayEntryExitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="entry" fill="#7b2cbf" />
                    <Bar dataKey="exit" fill="#9d4edd" />
                  </BarChart>
               </ResponsiveContainer>
             </div>
        </section>

        {/* ================= Attendance Trend (Full Width) ================= */}
        <div className="attendance-trend-container">
          <h3 className="attendance-title">
            Attendance Trend (Today: 8 AM – 6 PM)
          </h3>

          <div className="attendance-filters">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={lineFilters.date}
                onChange={(e) =>
                  setLineFilters({ ...lineFilters, date: e.target.value })
                }
              />
            </div>

            <div>
              <label>From</label>
              <select
                value={lineFilters.startHour}
                onChange={(e) =>
                  setLineFilters({ ...lineFilters, startHour: Number(e.target.value) })
                }
              >
                {[...Array(24)].map((_, h) => {
                const hour12 = h % 12 === 0 ? 12 : h % 12;
                const period = h < 12 ? "AM" : "PM";

                return (
                  <option key={h} value={h}>
                    {hour12} {period}
                  </option>
                );
              })}
              </select>
            </div>

            <div>
              <label>To</label>
              <select
                value={lineFilters.endHour}
                onChange={(e) =>
                  setLineFilters({ ...lineFilters, endHour: Number(e.target.value) })
                }
              >
                {[...Array(24)].map((_, h) => (
                  <option key={h} value={h}>
                    {h <= 12 ? `${h} AM` : `${h - 12} PM`}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={attendanceLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />

              {/* ENTRY */}
              <Line
                type="monotone"
                dataKey="entry"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Check-in"
              />

              {/* EXIT */}
              <Line
                type="monotone"
                dataKey="exit"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Check-out"
              />

              {/* SKIPPING */}
              <Line
                type="monotone"
                dataKey="skip"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Skipping"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;
