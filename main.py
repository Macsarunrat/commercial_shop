from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
# from database import create_db_and_tables
from database import create_db_and_tables
from api import products, category, brand, image, paidtype, storefront, cart, orders, user, user_address, shop, shop_address
import os

app = FastAPI(title="Zhopee")

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(products.router)
app.include_router(category.router)
app.include_router(brand.router)
app.include_router(image.router)
app.include_router(paidtype.router)
app.include_router(storefront.router)   
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(user.router)
app.include_router(shop.router)
app.include_router(shop_address.router)
app.include_router(user_address.router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # หรือใส่ ["http://localhost:3000"] เฉพาะ origin ของ React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
