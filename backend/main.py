from fastapi import FastAPI

app = FastAPI()


@app.get("/up")
def read_root():
    return {"message": "Yes I am up"}
