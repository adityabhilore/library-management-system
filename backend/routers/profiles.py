from fastapi import APIRouter, HTTPException
from database import get_db_connection
from utils import normalize_text

router = APIRouter(prefix="/admin/profile", tags=["Profiles"])


# =========================================================
# GET MEMBER PROFILE (Student or Teacher)
# =========================================================
@router.get("/member/{user_id}")
def get_member_profile(user_id: str):
    user_id = normalize_text(user_id, "upper")

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    # Try student first
    cur.execute("SELECT * FROM students WHERE student_id = %s", (user_id,))
    student = cur.fetchone()

    if student:
        profile = {
            "role": "student",
            "id": student["student_id"],
            "name": student["name"],
            "department": student["department"],
            "year": student.get("year"),
            "division": student.get("division"),
            "batch": student.get("batch"),
            "email": student.get("email"),
            "contact_no": student.get("contact_no"),
        }
    else:
        # Try teacher
        cur.execute("SELECT * FROM teachers WHERE teacher_id = %s", (user_id,))
        teacher = cur.fetchone()

        if not teacher:
            conn.close()
            raise HTTPException(status_code=404, detail="Member not found")

        profile = {
            "role": "teacher",
            "id": teacher["teacher_id"],
            "name": teacher["name"],
            "department": teacher["department"],
            "email": teacher.get("email"),
            "contact_no": teacher.get("contact_no"),
            "designation": teacher.get("designation"),
        }

    conn.close()
    return profile


# =========================================================
# GET MEMBER SCAN HISTORY (Paginated)
# =========================================================
@router.get("/member/{user_id}/logs")
def get_member_logs(user_id: str, page: int = 1, page_size: int = 15):
    user_id = normalize_text(user_id, "upper")
    import math

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    # Count
    cur.execute("SELECT COUNT(*) AS total FROM logs WHERE user_id = %s", (user_id,))
    total = cur.fetchone()["total"]
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size

    cur.execute("""
        SELECT log_id, user_id, action, status,
               matched_subject, matched_teacher_id, scan_time
        FROM logs
        WHERE user_id = %s
        ORDER BY scan_time DESC
        LIMIT %s OFFSET %s
    """, (user_id, page_size, offset))

    rows = cur.fetchall()
    conn.close()

    return {
        "data": rows,
        "total": total,
        "total_pages": total_pages
    }


# =========================================================
# GET MEMBER ATTENDANCE STATS
# =========================================================
@router.get("/member/{user_id}/stats")
def get_member_stats(user_id: str):
    user_id = normalize_text(user_id, "upper")

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    # Total entries & exits
    cur.execute("""
        SELECT
            SUM(action='ENTRY') AS total_entries,
            SUM(action='EXIT') AS total_exits,
            SUM(status='SKIP') AS total_skips,
            COUNT(*) AS total_scans,
            MIN(scan_time) AS first_scan,
            MAX(scan_time) AS last_scan
        FROM logs
        WHERE user_id = %s
    """, (user_id,))
    stats = cur.fetchone()

    # Total library hours (approximate: sum of entry-to-exit pairs)
    cur.execute("""
        SELECT SUM(
            TIMESTAMPDIFF(MINUTE, entry_time, exit_time)
        ) AS total_minutes
        FROM (
            SELECT
                l1.scan_time AS entry_time,
                (
                    SELECT MIN(l2.scan_time) FROM logs l2
                    WHERE l2.user_id = l1.user_id
                      AND l2.action = 'EXIT'
                      AND l2.scan_time > l1.scan_time
                ) AS exit_time
            FROM logs l1
            WHERE l1.user_id = %s AND l1.action = 'ENTRY'
        ) AS pairs
        WHERE exit_time IS NOT NULL
    """, (user_id,))
    hours_row = cur.fetchone()
    total_minutes = hours_row["total_minutes"] or 0

    # Days visited (unique dates)
    cur.execute("""
        SELECT COUNT(DISTINCT DATE(scan_time)) AS days_visited
        FROM logs
        WHERE user_id = %s AND action = 'ENTRY'
    """, (user_id,))
    days_visited = cur.fetchone()["days_visited"]

    # Attendance by day of week
    cur.execute("""
        SELECT
            DAYNAME(scan_time) AS day_name,
            COUNT(*) AS count
        FROM logs
        WHERE user_id = %s AND action = 'ENTRY'
        GROUP BY DAYNAME(scan_time), DAYOFWEEK(scan_time)
        ORDER BY DAYOFWEEK(scan_time)
    """, (user_id,))
    by_day = cur.fetchall()

    # Monthly trend (last 6 months)
    cur.execute("""
        SELECT
            DATE_FORMAT(scan_time, '%%Y-%%m') AS month,
            DATE_FORMAT(scan_time, '%%b %%Y') AS label,
            SUM(action='ENTRY') AS entries,
            SUM(status='SKIP') AS skips
        FROM logs
        WHERE user_id = %s
          AND scan_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(scan_time, '%%Y-%%m'), DATE_FORMAT(scan_time, '%%b %%Y')
        ORDER BY month
    """, (user_id,))
    monthly = cur.fetchall()

    # Subjects skipped (if student)
    cur.execute("""
        SELECT matched_subject, COUNT(*) AS count
        FROM logs
        WHERE user_id = %s AND status = 'SKIP' AND matched_subject IS NOT NULL
        GROUP BY matched_subject
        ORDER BY count DESC
    """, (user_id,))
    skipped_subjects = cur.fetchall()

    conn.close()

    return {
        "total_entries": stats["total_entries"] or 0,
        "total_exits": stats["total_exits"] or 0,
        "total_skips": stats["total_skips"] or 0,
        "total_scans": stats["total_scans"] or 0,
        "first_scan": stats["first_scan"],
        "last_scan": stats["last_scan"],
        "total_hours": round(total_minutes / 60, 1),
        "total_minutes": total_minutes,
        "days_visited": days_visited,
        "attendance_by_day": by_day,
        "monthly_trend": monthly,
        "skipped_subjects": skipped_subjects
    }


# =========================================================
# ATTENDANCE CALENDAR (dots for each day)
# =========================================================
@router.get("/member/{user_id}/calendar")
def get_member_calendar(user_id: str, year: int = None, month: int = None):
    user_id = normalize_text(user_id, "upper")

    now = datetime.now()
    if not year:
        year = now.year
    if not month:
        month = now.month

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT
            DATE(scan_time) AS date,
            SUM(action='ENTRY') AS entries,
            SUM(action='EXIT') AS exits,
            SUM(status='SKIP') AS skips
        FROM logs
        WHERE user_id = %s
          AND YEAR(scan_time) = %s
          AND MONTH(scan_time) = %s
        GROUP BY DATE(scan_time)
        ORDER BY date
    """, (user_id, year, month))

    rows = cur.fetchall()
    conn.close()

    result = []
    for r in rows:
        d = r["date"]
        result.append({
            "date": d.strftime("%Y-%m-%d") if hasattr(d, 'strftime') else str(d),
            "entries": r["entries"],
            "exits": r["exits"],
            "skips": r["skips"],
            "status": "skip" if r["skips"] > 0 else "present"
        })

    return result


from datetime import datetime
