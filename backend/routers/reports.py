from fastapi import APIRouter
from database import get_db_connection
from datetime import datetime, timedelta
from utils import normalize_text

router = APIRouter(prefix="/admin/reports", tags=["Reports"])


# =========================================================
# OVERVIEW STATS (Summary cards)
# =========================================================
@router.get("/overview")
def report_overview():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    today = datetime.now().strftime("%Y-%m-%d")

    # Total members
    cur.execute("SELECT COUNT(*) AS cnt FROM students")
    total_students = cur.fetchone()["cnt"]
    cur.execute("SELECT COUNT(*) AS cnt FROM teachers")
    total_teachers = cur.fetchone()["cnt"]

    # Total logs
    cur.execute("SELECT COUNT(*) AS cnt FROM logs")
    total_logs = cur.fetchone()["cnt"]

    # Today entries/exits
    cur.execute("SELECT COUNT(*) AS cnt FROM logs WHERE DATE(scan_time)=%s AND action='ENTRY'", (today,))
    today_entries = cur.fetchone()["cnt"]
    cur.execute("SELECT COUNT(*) AS cnt FROM logs WHERE DATE(scan_time)=%s AND action='EXIT'", (today,))
    today_exits = cur.fetchone()["cnt"]

    # Total skip alerts
    cur.execute("SELECT COUNT(*) AS cnt FROM logs WHERE status='SKIP'")
    total_skips = cur.fetchone()["cnt"]

    # This week entries
    week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime("%Y-%m-%d")
    cur.execute("SELECT COUNT(*) AS cnt FROM logs WHERE DATE(scan_time) >= %s", (week_start,))
    week_entries = cur.fetchone()["cnt"]

    # Currently inside (entry without matching exit)
    cur.execute("""
        SELECT COUNT(DISTINCT user_id) AS cnt
        FROM logs l1
        WHERE action='ENTRY'
          AND NOT EXISTS (
              SELECT 1 FROM logs l2
              WHERE l2.user_id = l1.user_id
                AND l2.action='EXIT'
                AND l2.scan_time > l1.scan_time
          )
          AND DATE(l1.scan_time) = CURDATE()
    """)
    currently_inside = cur.fetchone()["cnt"]

    conn.close()

    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_logs": total_logs,
        "today_entries": today_entries,
        "today_exits": today_exits,
        "total_skips": total_skips,
        "week_entries": week_entries,
        "currently_inside": currently_inside
    }


# =========================================================
# PEAK HOURS ANALYSIS
# =========================================================
@router.get("/peak-hours")
def peak_hours(date: str = None, days: int = 7):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    if date:
        cur.execute("""
            SELECT HOUR(scan_time) AS hour,
                   COUNT(*) AS total,
                   SUM(action='ENTRY') AS entries,
                   SUM(action='EXIT') AS exits
            FROM logs
            WHERE DATE(scan_time) = %s
            GROUP BY HOUR(scan_time)
            ORDER BY hour
        """, (date,))
    else:
        cur.execute("""
            SELECT HOUR(scan_time) AS hour,
                   COUNT(*) AS total,
                   SUM(action='ENTRY') AS entries,
                   SUM(action='EXIT') AS exits
            FROM logs
            WHERE DATE(scan_time) >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
            GROUP BY HOUR(scan_time)
            ORDER BY hour
        """, (days,))

    rows = cur.fetchall()
    conn.close()

    # Fill all 24 hours
    result = []
    for h in range(24):
        row = next((r for r in rows if r["hour"] == h), None)
        label = f"{h if h <= 12 else h-12} {'AM' if h < 12 else 'PM'}"
        if h == 0:
            label = "12 AM"
        if h == 12:
            label = "12 PM"
        result.append({
            "hour": h,
            "label": label,
            "total": row["total"] if row else 0,
            "entries": row["entries"] if row else 0,
            "exits": row["exits"] if row else 0
        })

    return result


# =========================================================
# TOP SKIPPERS (Students with most skipping alerts)
# =========================================================
@router.get("/top-skippers")
def top_skippers(limit: int = 10, days: int = 30):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT
            l.user_id,
            s.name,
            s.department,
            s.year,
            s.division,
            COUNT(*) AS skip_count,
            GROUP_CONCAT(DISTINCT l.matched_subject ORDER BY l.matched_subject SEPARATOR ', ') AS subjects_skipped,
            MAX(l.scan_time) AS last_skip
        FROM logs l
        JOIN students s ON s.student_id = l.user_id
        WHERE l.status = 'SKIP'
          AND DATE(l.scan_time) >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
        GROUP BY l.user_id, s.name, s.department, s.year, s.division
        ORDER BY skip_count DESC
        LIMIT %s
    """, (days, limit))

    rows = cur.fetchall()
    conn.close()
    return rows


# =========================================================
# WEEKLY TREND (Last 7 days, entries per day)
# =========================================================
@router.get("/weekly-trend")
def weekly_trend(days: int = 7):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT
            DATE(scan_time) AS date,
            SUM(action='ENTRY') AS entries,
            SUM(action='EXIT') AS exits,
            SUM(status='SKIP') AS skips,
            COUNT(*) AS total
        FROM logs
        WHERE DATE(scan_time) >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
        GROUP BY DATE(scan_time)
        ORDER BY date
    """, (days,))

    rows = cur.fetchall()
    conn.close()

    # Format dates
    result = []
    for r in rows:
        d = r["date"]
        if hasattr(d, 'strftime'):
            label = d.strftime("%a %d/%m")
            date_str = d.strftime("%Y-%m-%d")
        else:
            label = str(d)
            date_str = str(d)

        result.append({
            "date": date_str,
            "label": label,
            "entries": r["entries"],
            "exits": r["exits"],
            "skips": r["skips"],
            "total": r["total"]
        })

    return result


# =========================================================
# DEPARTMENT-WISE ATTENDANCE
# =========================================================
@router.get("/department-attendance")
def department_attendance(days: int = 30):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT
            COALESCE(s.department, t.department) AS department,
            COUNT(*) AS total_scans,
            SUM(l.action='ENTRY') AS entries,
            SUM(l.action='EXIT') AS exits,
            SUM(l.status='SKIP') AS skips
        FROM logs l
        LEFT JOIN students s ON s.student_id = l.user_id
        LEFT JOIN teachers t ON t.teacher_id = l.user_id
        WHERE DATE(l.scan_time) >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
        GROUP BY COALESCE(s.department, t.department)
        ORDER BY total_scans DESC
    """, (days,))

    rows = cur.fetchall()
    conn.close()
    return rows


# =========================================================
# MONTHLY COMPARISON (Current month vs Previous month)
# =========================================================
@router.get("/monthly-comparison")
def monthly_comparison():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    now = datetime.now()
    current_month_start = now.replace(day=1).strftime("%Y-%m-%d")

    if now.month == 1:
        prev_month_start = now.replace(year=now.year-1, month=12, day=1).strftime("%Y-%m-%d")
    else:
        prev_month_start = now.replace(month=now.month-1, day=1).strftime("%Y-%m-%d")

    prev_month_end = (now.replace(day=1) - timedelta(days=1)).strftime("%Y-%m-%d")

    # Current month
    cur.execute("""
        SELECT COUNT(*) AS total,
               SUM(action='ENTRY') AS entries,
               SUM(action='EXIT') AS exits,
               SUM(status='SKIP') AS skips
        FROM logs WHERE DATE(scan_time) >= %s
    """, (current_month_start,))
    current = cur.fetchone()

    # Previous month
    cur.execute("""
        SELECT COUNT(*) AS total,
               SUM(action='ENTRY') AS entries,
               SUM(action='EXIT') AS exits,
               SUM(status='SKIP') AS skips
        FROM logs WHERE DATE(scan_time) >= %s AND DATE(scan_time) <= %s
    """, (prev_month_start, prev_month_end))
    previous = cur.fetchone()

    conn.close()

    return {
        "current_month": {
            "total": current["total"] or 0,
            "entries": current["entries"] or 0,
            "exits": current["exits"] or 0,
            "skips": current["skips"] or 0
        },
        "previous_month": {
            "total": previous["total"] or 0,
            "entries": previous["entries"] or 0,
            "exits": previous["exits"] or 0,
            "skips": previous["skips"] or 0
        }
    }
