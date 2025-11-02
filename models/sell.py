from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from decimal import Decimal
from sqlalchemy import ForeignKeyConstraint # สำหรับตั้งชื่อ Foreign Key
from .shop import Shop
from .products import Product
from .cart import Cart
from .orders import Order_Items


class Sell(SQLModel, table=True):
    __tablename__ = "Sell"
    Sell_ID: Optional[int] = Field(default=None, primary_key=True)
    Price: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    Stock: int = Field(default=0)
    
    Shop_ID: Optional[int] = Field(default=None)
    Product_ID: Optional[int] = Field(default=None)
    


    shop: "Shop" = Relationship(back_populates="sell_items") 
    product: "Product" = Relationship(back_populates="sell_items")


    cart_items: List["Cart"] = Relationship(back_populates="sell_item")

    order_items: List["Order_Items"] = Relationship(back_populates="sell_item")
    




    __table_args__ = (
        ForeignKeyConstraint(["Shop_ID"], ["Shop.Shop_ID"], name="fk_sell_shop"),
        ForeignKeyConstraint(["Product_ID"], ["Product.Product_ID"], name="fk_sell_product"),
    )
