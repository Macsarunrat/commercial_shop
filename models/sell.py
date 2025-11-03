from __future__ import annotations
from sqlmodel import SQLModel,Field,Column, DECIMAL, Relationship, table
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy.orm import relationship


if TYPE_CHECKING:
    from .shop import Shop
    from .products import Products
    from .orderitems import OrderItems
    from .cart import Cart

    
class SellBase(SQLModel):
    Price : Decimal = Field(sa_column=Column(DECIMAL(10,2)))
    Stock : int

class Sell(SellBase, table =True):
    __tablename__ = "sell"
    Sell_ID : int = Field(primary_key=True)
    Shop_ID : int = Field(foreign_key="shop.Shop_ID")
    Product_ID : int = Field(foreign_key="products.Product_ID")

Sell.products = Relationship(sa_relationship=relationship(back_populates="sell"))
Sell.shop = Relationship(sa_relationship=relationship(back_populates="sell"))
Sell.orderitems = Relationship(sa_relationship=relationship(back_populates="sell"))
Sell.cart = Relationship(sa_relationship=relationship(back_populates="sell"))