from fastapi import APIRouter, HTTPException
from database import get_db_connection
from pydantic import BaseModel
from typing import List
from utils import normalize_text, normalize_date

router = APIRouter(prefix="/academic-calendar", tags=["Academic Calendar"])


# ---------- SCHEMA ----------
class AcademicEvent(BaseModel):
    date: str
    event_type: str
    description: str


# ---------- GET ALL EVENTS ----------
@router.get("/", response_model=List[dict])
def get_events():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM academic_calendar ORDER BY date ASC")
    events = cursor.fetchall()

    cursor.close()
    conn.close()
    return events


# ---------- ADD EVENT ----------
@router.post("/")
def add_event(event: AcademicEvent):
    event.event_type = normalize_text(event.event_type, "upper")       # ✅ ADDED
    event.description = normalize_text(event.description, "sentence")  # ✅ ADDED
    try:
        event.date = normalize_date(event.date)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO academic_calendar (date, event_type, description)
    VALUES (%s, %s, %s)
    """
    values = (event.date, event.event_type, event.description)

    cursor.execute(query, values)
    conn.commit()

    cursor.close()
    conn.close()
    return {"message": "Academic event added successfully"}


# ---------- UPDATE EVENT ----------
@router.put("/{event_id}")
def update_event(event_id: int, event: AcademicEvent):
    event.event_type = normalize_text(event.event_type, "upper")       # ✅ ADDED
    event.description = normalize_text(event.description, "sentence")  # ✅ ADDED
    try:
        event.date = normalize_date(event.date)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    UPDATE academic_calendar
    SET date=%s, event_type=%s, description=%s
    WHERE event_id=%s
    """
    values = (event.date, event.event_type, event.description, event_id)

    cursor.execute(query, values)
    conn.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    cursor.close()
    conn.close()
    return {"message": "Academic event updated successfully"}


# ---------- DELETE EVENT ----------
@router.delete("/{event_id}")
def delete_event(event_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM academic_calendar WHERE event_id=%s",
        (event_id,)
    )
    conn.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    cursor.close()
    conn.close()
    return {"message": "Academic event deleted successfully"}


# ---------- BULK ADD ----------
@router.post("/bulk")
def bulk_add_events(events: List[AcademicEvent]):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO academic_calendar (date, event_type, description)
    VALUES (%s, %s, %s)
    """

    values = []
    for e in events:
        try:
            normalized_date = normalize_date(e.date)
        except ValueError as exc:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=400, detail=str(exc))

        values.append(
            (
                normalized_date,
                normalize_text(e.event_type, "upper"),        # ✅ ADDED
                normalize_text(e.description, "sentence")     # ✅ ADDED
            )
        )

    cursor.executemany(query, values)

    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Bulk events uploaded successfully"}


# from fastapi import APIRouter, HTTPException
# from database import get_db_connection
# from pydantic import BaseModel
# from typing import List

# router = APIRouter(prefix="/academic-calendar", tags=["Academic Calendar"])


# # ---------- SCHEMA ----------
# class AcademicEvent(BaseModel):
#     date: str
#     event_type: str
#     description: str


# # ---------- GET ALL EVENTS ----------
# @router.get("/", response_model=List[dict])
# def get_events():
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)

#     cursor.execute("SELECT * FROM academic_calendar ORDER BY date ASC")
#     events = cursor.fetchall()

#     cursor.close()
#     conn.close()
#     return events


# # ---------- ADD EVENT ----------
# @router.post("/")
# def add_event(event: AcademicEvent):
#     conn = get_db_connection()
#     cursor = conn.cursor()

#     query = """
#     INSERT INTO academic_calendar (date, event_type, description)
#     VALUES (%s, %s, %s)
#     """
#     values = (event.date, event.event_type, event.description)

#     cursor.execute(query, values)
#     conn.commit()

#     cursor.close()
#     conn.close()
#     return {"message": "Academic event added successfully"}


# # ---------- UPDATE EVENT ----------
# @router.put("/{event_id}")
# def update_event(event_id: int, event: AcademicEvent):
#     conn = get_db_connection()
#     cursor = conn.cursor()

#     query = """
#     UPDATE academic_calendar
#     SET date=%s, event_type=%s, description=%s
#     WHERE event_id=%s
#     """
#     values = (event.date, event.event_type, event.description, event_id)

#     cursor.execute(query, values)
#     conn.commit()

#     if cursor.rowcount == 0:
#         raise HTTPException(status_code=404, detail="Event not found")

#     cursor.close()
#     conn.close()
#     return {"message": "Academic event updated successfully"}


# # ---------- DELETE EVENT ----------
# @router.delete("/{event_id}")
# def delete_event(event_id: int):
#     conn = get_db_connection()
#     cursor = conn.cursor()

#     cursor.execute(
#         "DELETE FROM academic_calendar WHERE event_id=%s",
#         (event_id,)
#     )
#     conn.commit()

#     if cursor.rowcount == 0:
#         raise HTTPException(status_code=404, detail="Event not found")

#     cursor.close()
#     conn.close()
#     return {"message": "Academic event deleted successfully"}


# @router.post("/bulk")
# def bulk_add_events(events: List[AcademicEvent]):
#     conn = get_db_connection()
#     cursor = conn.cursor()

#     query = """
#     INSERT INTO academic_calendar (date, event_type, description)
#     VALUES (%s, %s, %s)
#     """

#     values = [(e.date, e.event_type, e.description) for e in events]
#     cursor.executemany(query, values)

#     conn.commit()
#     cursor.close()
#     conn.close()

#     return {"message": "Bulk events uploaded successfully"}
