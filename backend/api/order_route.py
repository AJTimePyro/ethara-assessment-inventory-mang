from core.db import get_db
from fastapi import APIRouter, Depends
from schemas.order import OrderCreate, OrderResponse
from services.order_service import OrderService
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=list[OrderResponse])
async def get_all_orders(db: Session = Depends(get_db)):
    order_service = OrderService(db)
    return order_service.get_all_orders()


@router.post("/create", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    order_service = OrderService(db)
    return order_service.create_order(order_data)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order_service = OrderService(db)
    return order_service.get_order_by_id(order_id)


@router.delete("/{order_id}")
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    order_service = OrderService(db)
    return order_service.delete_order(order_id)
