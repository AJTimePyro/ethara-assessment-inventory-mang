from core.db import get_db
from fastapi import APIRouter, Depends
from schemas.customer import CustomerCreate, CustomerResponse
from services.customer_service import CustomerService
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=list[CustomerResponse])
async def get_all_customers(db: Session = Depends(get_db)):
    customer_service = CustomerService(db)
    return customer_service.get_all_customers()


@router.post("/create", response_model=CustomerResponse)
async def create_customer(customer_data: CustomerCreate, db: Session = Depends(get_db)):
    customer_service = CustomerService(db)
    return customer_service.create_customer(customer_data)


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer_service = CustomerService(db)
    return customer_service.get_customer_by_id(customer_id)


@router.delete("/{customer_id}")
async def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer_service = CustomerService(db)
    return customer_service.delete_customer(customer_id)
