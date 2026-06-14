from pydantic import BaseModel

from .product import ProductResponse as LowStockProduct


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_count: int
    low_stock_threshold: int
    low_stock_products: list[LowStockProduct]
