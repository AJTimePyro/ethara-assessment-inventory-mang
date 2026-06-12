from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    sku_code: str
    product_name: str
    price: Decimal
    quantity: int


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    sku_code: Optional[str] = None
    product_name: Optional[str] = None
    price: Optional[Decimal] = None
    quantity: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
