from fastapi import HTTPException
from models.customer import Customer
from models.order import Order
from models.product import Product
from schemas.customer import CustomerCreate
from sqlalchemy.orm import Session


class CustomerService:
    def __init__(self, db: Session):
        self._db = db

    def get_all_customers(self):
        return self._db.query(Customer).all()

    def get_customer_by_id(self, customer_id: int):
        customer = self._db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer

    def delete_customer(self, customer_id: int):
        customer = self.get_customer_by_id(customer_id)

        # Cascade delete orders and restore product quantities
        orders = self._db.query(Order).filter(Order.customer_id == customer_id).all()
        for order in orders:
            for item in order.items:
                product = (
                    self._db.query(Product)
                    .filter(Product.id == item.product_id)
                    .with_for_update()
                    .first()
                )
                if product:
                    product.quantity += item.quantity
                self._db.delete(item)
            self._db.delete(order)

        self._db.delete(customer)
        self._db.commit()
        return {"message": "Customer and associated orders deleted successfully"}

    def create_customer(self, customer_data: CustomerCreate):
        if len(str(customer_data.phone_no)) != 10:
            raise HTTPException(
                status_code=400, detail="Phone number must be exactly 10 digits"
            )

        existing_customer = (
            self._db.query(Customer)
            .filter(Customer.email == customer_data.email)
            .first()
        )
        if existing_customer:
            raise HTTPException(status_code=400, detail="Email already registered")

        customer = Customer(**customer_data.model_dump())
        self._db.add(customer)
        self._db.commit()
        self._db.refresh(customer)
        return customer
