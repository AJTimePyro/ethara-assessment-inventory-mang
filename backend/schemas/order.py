from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    purchased_price: Decimal
    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    items: list[OrderItemResponse]
    model_config = ConfigDict(from_attributes=True)
