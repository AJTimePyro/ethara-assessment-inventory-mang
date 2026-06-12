from sqlalchemy import Column, Integer, String

from . import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone_no = Column(Integer, nullable=False)
