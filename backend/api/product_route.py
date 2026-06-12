from core.db import get_db
from fastapi import APIRouter, Depends
from schemas.product import ProductCreate, ProductResponse, ProductUpdate
from services.product_service import ProductService
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=list[ProductResponse])
async def get_all_products(db: Session = Depends(get_db)):
    product_service = ProductService(db)
    return product_service.get_all_products()


@router.post("/create", response_model=ProductResponse)
async def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    product_service = ProductService(db)
    return product_service.create_product(product_data)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product_service = ProductService(db)
    return product_service.get_product_by_id(product_id)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int, product_data: ProductUpdate, db: Session = Depends(get_db)
):
    product_service = ProductService(db)
    return product_service.update_product(product_id, product_data)


@router.delete("/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    product_service = ProductService(db)
    return product_service.delete_product(product_id)
