from api.customer_route import router as customer_router
from api.product_route import router as product_router
from fastapi import FastAPI

app = FastAPI()


@app.get("/up")
def read_root():
    return {"message": "Yes I am up"}


app.include_router(customer_router, prefix="/customer")
app.include_router(product_router, prefix="/product")
