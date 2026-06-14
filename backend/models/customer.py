from core.db import Base
from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    phone_no: Mapped[int] = mapped_column(BigInteger, nullable=False)
