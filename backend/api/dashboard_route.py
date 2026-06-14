from core.db import get_db
from fastapi import APIRouter, Depends
from schemas.dashboard import DashboardSummary
from services.dashboard_service import DashboardService
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=DashboardSummary)
async def get_dashboard_summary(db: Session = Depends(get_db)):
    service = DashboardService(db)
    return service.get_summary()
