from core.db import get_db
from fastapi import APIRouter, Depends
from schemas.customer import CustomerResponse
from services.customer_service import CustomerService
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=list[CustomerResponse])
async def get_all_customers(db: Session = Depends(get_db)):
    customer_service = CustomerService(db)
    return customer_service.get_all_customers()
