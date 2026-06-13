from api.customer_route import router as customer_router
from api.order_route import router as order_router
from api.product_route import router as product_router
from core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [settings.CORS_ORIGIN]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/up")
def read_root():
    return {"message": "Yes I am up"}


app.include_router(customer_router, prefix="/customer")
app.include_router(product_router, prefix="/product")
app.include_router(order_router, prefix="/order")
