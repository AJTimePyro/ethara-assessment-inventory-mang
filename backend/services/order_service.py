from fastapi import HTTPException
from models.customer import Customer
from models.order import Order, OrderItem
from models.product import Product
from schemas.order import OrderCreate
from sqlalchemy.orm import Session, selectinload


class OrderService:
    def __init__(self, db: Session):
        self._db = db

    def get_all_orders(self):
        return self._db.query(Order).options(selectinload(Order.items)).all()

    def get_order_by_id(self, order_id: int):
        order = (
            self._db.query(Order)
            .options(selectinload(Order.items))
            .filter(Order.id == order_id)
            .first()
        )
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    def delete_order(self, order_id: int):
        order = self.get_order_by_id(order_id)

        try:
            for item in order.items:
                product = (
                    self._db.query(Product)
                    .filter(Product.id == item.product_id)
                    .with_for_update()
                    .first()
                )
                if product:
                    product.quantity += item.quantity
                # else:     # For Now our code will ignore if product is already deleted
                #     raise HTTPException(
                #         status_code=404,
                #         detail=f"Product not found for order item {item.id}",
                #     )

                self._db.delete(item)

            self._db.delete(order)
            self._db.commit()
            return {"message": "Order deleted successfully"}
        # except HTTPException:
        #     self._db.rollback()
        #     raise
        except Exception:
            self._db.rollback()
            raise HTTPException(status_code=500, detail="Failed to delete order")

    def create_order(self, order_data: OrderCreate):
        if not order_data.items:
            raise HTTPException(
                status_code=400, detail="Order must contain at least one item"
            )

        customer = (
            self._db.query(Customer)
            .filter(Customer.id == order_data.customer_id)
            .first()
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        aggregated_items: dict[int, int] = {}
        for item in order_data.items:
            if item.quantity <= 0:
                raise HTTPException(
                    status_code=400, detail="Item quantity must be greater than 0"
                )
            aggregated_items[item.product_id] = (
                aggregated_items.get(item.product_id, 0) + item.quantity
            )

        try:
            products_by_id: dict[int, Product] = {}
            for product_id, quantity in aggregated_items.items():
                product = (
                    self._db.query(Product)
                    .filter(Product.id == product_id)
                    .with_for_update()
                    .first()
                )
                if product is None:
                    raise HTTPException(
                        status_code=404, detail=f"Product not found: {product_id}"
                    )

                if product.quantity < quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Insufficient stock for product {product.product_name}",
                    )

                products_by_id[product_id] = product

            order = Order(customer_id=order_data.customer_id)
            self._db.add(order)
            self._db.flush()
            created_order_id = order.id

            for product_id, quantity in aggregated_items.items():
                product = products_by_id[product_id]
                product.quantity -= quantity

                order_item = OrderItem(
                    order_id=created_order_id,
                    product_id=product_id,
                    quantity=quantity,
                    purchased_price=product.price,
                )
                self._db.add(order_item)

            self._db.commit()
            return self.get_order_by_id(created_order_id)
        except HTTPException:
            self._db.rollback()
            raise
        except Exception:
            self._db.rollback()
            raise HTTPException(status_code=500, detail="Failed to create order")
