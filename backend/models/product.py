from sqlalchemy import Column, Integer, Numeric, String

from . import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku_code = Column(String, unique=True, nullable=False)
    product_name = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
