from datetime import datetime
from database import get_db_connection
from utils import (
    check_teacher,
    check_student,
    get_last_action,
    insert_log,
    send_skip_email,
    normalize_text
)


# =========================================================
# MAIN FUNCTION
# =========================================================
def process_scan(user_id: str):

    user_id = normalize_text(user_id, "upper")

    if not user_id:
        return {"status": "ERROR", "message": "Invalid ID"}

    # ENTRY / EXIT logic
    last_action = get_last_action(user_id)
    next_action = "EXIT" if last_action == "ENTRY" else "ENTRY"

    # If today has any academic calendar event, do not mark students as skipping lectures.
    if next_action == "ENTRY" and is_academic_calendar_day():
        teacher = check_teacher(user_id)
        if teacher:
            insert_log(
                student_id=user_id,
                action=normalize_text(next_action, "upper"),
                status="NORMAL"
            )

            return {
                "status": "SUCCESS",
                "role": "teacher",
                "action": next_action,
                "message": f"Teacher {next_action} Successful"
            }

        student = check_student(user_id)
        if student:
            insert_log(
                student_id=user_id,
                action=normalize_text(next_action, "upper"),
                status="NORMAL"
            )

            return {
                "status": "SUCCESS",
                "role": "student",
                "action": next_action,
                "message": f"Student {next_action} Successful"
            }

    # ================= TEACHER =================
    teacher = check_teacher(user_id)
    if teacher:

        insert_log(
            student_id=user_id,
            action=normalize_text(next_action, "upper"),
            status="NORMAL"
        )

        return {
            "status": "SUCCESS",
            "role": "teacher",
            "action": next_action,
            "message": f"Teacher {next_action} Successful"
        }

    # ================= STUDENT =================
    student = check_student(user_id)
    if student:

        status = "NORMAL"
        matched_subject = None
        matched_teacher_id = None

        # 🔍 SKIP CHECK (only on ENTRY)
        if next_action == "ENTRY":

            lecture = get_current_lecture(
                department=normalize_text(student["department"], "upper"),
                year=normalize_text(student["year"], "upper"),
                division=normalize_text(student["division"], "upper"),
                batch=normalize_text(student["batch"], "upper")
            )

            if lecture:
                status = "SKIP"
                matched_subject = lecture["subject"]
                matched_teacher_id = lecture["teacher_id"]

        # 📝 Insert log
        log_id = insert_log(
            student_id=user_id,
            action=normalize_text(next_action, "upper"),
            status=normalize_text(status, "upper"),
            matched_subject=matched_subject,
            matched_teacher_id=matched_teacher_id
        )

        # 📧 Send email if skipped
        if status == "SKIP":
            trigger_skip_email(log_id)

            return {
                    "status": "DENIED",
                    "role": "student",
                    "action": next_action,
                    "message": "Skipping Lecture"
                }

        # NORMAL CASE
        return {
                "status": "SUCCESS",
                "role": "student",
                "action": next_action,
                "message": f"Student {next_action} Successful"
        }

    # ================= INVALID =================
    return {
        "status": "ERROR",
        "message": "INVALID ID"
    }


# =========================================================
# HELPER: GET CURRENT LECTURE
# =========================================================
def get_current_lecture(department, year, division, batch):

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    now = datetime.now()
    day = normalize_text(now.strftime("%A"), "title")
    current_time = now.strftime("%H:%M")

    cur.execute("""
        SELECT subject, teacher_id
        FROM timetable
        WHERE department=%s
          AND year=%s
          AND division=%s
          AND (batch IS NULL OR batch=%s)
          AND day_of_week=%s
          AND %s BETWEEN start_time AND end_time
    """, (
        department,
        year,
        division,
        batch,
        day,
        current_time
    ))

    lecture = cur.fetchone()
    conn.close()
    return lecture


# =========================================================
# HELPER: CHECK ACADEMIC CALENDAR DAY
# =========================================================
def is_academic_calendar_day():

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    today = datetime.now().strftime("%Y-%m-%d")

    cur.execute(
        """
        SELECT event_id
        FROM academic_calendar
        WHERE date = %s
        LIMIT 1
        """,
        (today,)
    )

    event = cur.fetchone()
    conn.close()
    return event is not None


# =========================================================
# HELPER: SEND EMAIL
# =========================================================
def trigger_skip_email(log_id):

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT l.matched_subject, l.matched_teacher_id, l.scan_time,
               s.name AS student_name,s.student_id
        FROM logs l
        JOIN students s ON l.user_id = s.student_id
        WHERE l.log_id = %s
    """, (log_id,))
    log = cur.fetchone()

    if not log or not log["matched_teacher_id"]:
        conn.close()
        return

    cur.execute("""
        SELECT name, email
        FROM teachers
        WHERE teacher_id = %s
    """, (log["matched_teacher_id"],))
    teacher = cur.fetchone()

    if not teacher:
        conn.close()
        return

    send_skip_email(
        teacher_email=teacher["email"],
        teacher_name=teacher["name"],
        student_name=log["student_name"],
        student_id=log["student_id"],
        subject=log["matched_subject"],
        scan_time=log["scan_time"]
    )

    conn.close()