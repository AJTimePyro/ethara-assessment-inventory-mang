from api.customer_route import router as customer_router
from fastapi import FastAPI

app = FastAPI()


@app.get("/up")
def read_root():
    return {"message": "Yes I am up"}


app.include_router(customer_router, prefix="/customer")
