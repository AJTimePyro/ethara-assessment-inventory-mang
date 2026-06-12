from models.customer import Customer
from sqlalchemy.orm import Session


class CustomerService:
    def __init__(self, db: Session):
        self._db = db

    def get_all_customers(self):
        return self._db.query(Customer).all()
