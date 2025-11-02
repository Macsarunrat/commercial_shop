from sqlmodel import SQLModel, Field, Relationship
from .shop import Shop
from .orders import Orders




class Shop_Orders(SQLModel, table=True):
    __tablename__ = "Shop_Orders"

    Order_ID: int = Field(foreign_key="Orders.Order_ID", primary_key=True)
    Shop_ID: int = Field(foreign_key="Shop.Shop_ID", primary_key=True)
    
    order: "Orders" = Relationship(back_populates="shop_links")
    shop: "Shop" = Relationship(back_populates="order_links")
