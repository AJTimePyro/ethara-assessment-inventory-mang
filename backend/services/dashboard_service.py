from core.config import settings
from models.customer import Customer
from models.order import Order
from models.product import Product
from sqlalchemy.orm import Session


class DashboardService:
    def __init__(self, db: Session):
        self._db = db

    def get_summary(self):
        total_products = self._db.query(Product).count()
        total_customers = self._db.query(Customer).count()
        total_orders = self._db.query(Order).count()
        low_stock_products = (
            self._db.query(Product)
            .filter(Product.quantity <= settings.LOW_STOCK_THRESHOLD)
            .all()
        )

        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "low_stock_count": len(low_stock_products),
            "low_stock_threshold": settings.LOW_STOCK_THRESHOLD,
            "low_stock_products": low_stock_products,
        }
