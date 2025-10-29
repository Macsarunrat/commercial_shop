from fastapi import FastAPI
from database import create_db_and_tables
from api import products,catagory,brand,image
import os

app = FastAPI(title="Zhopee")

app.include_router(products.router)
app.include_router(catagory.router)
app.include_router(brand.router)
app.include_router(image.router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()


