from __future__ import annotations
from sqlmodel import SQLModel, Field, DECIMAL, table, Relationship
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy import Column, DateTime
from decimal import Decimal

if TYPE_CHECKING:
    from .order import Order
    from .sell import Sell

#Create Base Class 
class OrderItemsBase(SQLModel):
    Quantity : int
    Price_At_Purchase : Decimal = Field(sa_column=Column(DECIMAL(10,2)))

class OrderItems(OrderItemsBase, table= True):
    __tablename__ = "orderitems"
    OrderItems_ID : Optional[int] = Field(primary_key=True,default=None)
    Order_ID : int = Field(foreign_key="orders.Order_ID")
    Sell_ID : int = Field(foreign_key="sell.Sell_ID")
    order : Optional["Order"] = Relationship(sa_relationship= relationship(back_populates="orderitems"))
    sell : Optional["Sell"] = Relationship(sa_relationship= relationship(back_populates="orderitems"))