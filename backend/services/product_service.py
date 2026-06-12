from fastapi import HTTPException
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate
from sqlalchemy.orm import Session


class ProductService:
    def __init__(self, db: Session):
        self._db = db

    def get_all_products(self):
        return self._db.query(Product).all()

    def get_product_by_id(self, product_id: int):
        product = self._db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    def delete_product(self, product_id: int):
        product = self.get_product_by_id(product_id)
        self._db.delete(product)
        self._db.commit()
        return {"message": "Product deleted successfully"}

    def create_product(self, product_data: ProductCreate):
        existing_product = (
            self._db.query(Product)
            .filter(Product.sku_code == product_data.sku_code)
            .first()
        )
        if existing_product:
            raise HTTPException(status_code=400, detail="SKU code already exists")

        if product_data.quantity < 0:
            raise HTTPException(status_code=400, detail="Quantity must be non-negative")

        if product_data.price < 0:
            raise HTTPException(status_code=400, detail="Price must be non-negative")

        product = Product(**product_data.model_dump())
        self._db.add(product)
        self._db.commit()
        self._db.refresh(product)
        return product

    def update_product(self, product_id: int, product_data: ProductUpdate):
        product = self.get_product_by_id(product_id)
        update_data = product_data.model_dump(exclude_none=True)

        if "sku_code" in update_data:
            existing = (
                self._db.query(Product)
                .filter(
                    Product.sku_code == update_data["sku_code"],
                    Product.id != product_id,
                )
                .first()
            )
            if existing:
                raise HTTPException(status_code=400, detail="SKU code already exists")

        if "quantity" in update_data and update_data["quantity"] < 0:
            raise HTTPException(status_code=400, detail="Quantity must be non-negative")

        if "price" in update_data and update_data["price"] < 0:
            raise HTTPException(status_code=400, detail="Price must be non-negative")

        for key, value in update_data.items():
            setattr(product, key, value)

        self._db.commit()
        self._db.refresh(product)
        return product
