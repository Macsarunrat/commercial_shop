from __future__ import annotations
from sqlmodel import SQLModel,Field, Relationship, table
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import relationship, Mapped

if TYPE_CHECKING:
    from .order import Order
    from .shop import Shop

class ShopOrderBase(SQLModel):
    pass
    
class ShopOrder(ShopOrderBase,table = True):
    __tablename__ = "shoporder"
    __table_args__ = {'extend_existing': True}
    Order_ID : int = Field(primary_key=True, foreign_key="orders.Order_ID")
    Shop_ID : int = Field(primary_key=True, foreign_key="shop.Shop_ID")
    
ShopOrder.order = Relationship(sa_relationship=relationship(back_populates="shoporder"))
ShopOrder.shop = Relationship(sa_relationship=relationship(back_populates="shoporder"))

