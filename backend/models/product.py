from decimal import Decimal

from core.db import Base
from sqlalchemy import Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sku_code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    product_name: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
