from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, table
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship

if TYPE_CHECKING:
    from .shop import Shop
    from .order import Order

class ShopOrdersBase(SQLModel):
    Shop_ID: int = Field(foreign_key="shop.Shop_ID", primary_key=True)
    Order_ID: int = Field(foreign_key="orders.Order_ID", primary_key=True)

class Shop_Orders(ShopOrdersBase, table=True):
    __tablename__ = "shop_orders"
    
    # Relationships
    shop: Mapped["Shop"] = Relationship(sa_relationship=relationship(back_populates="shop_orders"))
    order: Mapped["Order"] = Relationship(sa_relationship=relationship(back_populates="shoporders"))