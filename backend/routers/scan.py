from fastapi import APIRouter, HTTPException, BackgroundTasks
from schemas import ScanRequest
from services.scan_service import process_scan
from door_control import open_door

router = APIRouter(tags=["Scan"])


@router.post("/scan")
def scan_id(data: ScanRequest, background_tasks: BackgroundTasks):

    result = process_scan(data.user_id)

    if result["status"] == "ERROR":
        raise HTTPException(status_code=400, detail=result["message"])

    if result["status"] == "DENIED":
        raise HTTPException(status_code=403, detail=result["message"])

    # Open door only if allowed
    if result["status"] == "SUCCESS":
        background_tasks.add_task(open_door)

    return result