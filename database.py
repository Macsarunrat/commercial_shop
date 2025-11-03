from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
from models.category import Category
from models.products import Products
from models.images import Image
from models.brand import Brand
from models.order import Order
from models.paidtype import PaidType
from models.orderitems import OrderItems
from models.user import User
from models.useraddress import UserAddress

import os

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
