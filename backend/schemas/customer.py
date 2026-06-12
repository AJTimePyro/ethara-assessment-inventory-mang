from pydantic import BaseModel, ConfigDict, EmailStr


class CustomerBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_no: int


class CustomerResponse(CustomerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
