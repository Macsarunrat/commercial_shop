from __future__ import annotations
from sqlmodel import SQLModel,Field, Relationship, table
from typing import Optional,TYPE_CHECKING,List
from sqlalchemy.orm import relationship

if TYPE_CHECKING:
    from .user import User
    from .sell import Sell


class CartBase(SQLModel):
    Quantity : int

class Cart(CartBase,table = True):
    __tablename__ = "cart"
    Cart_ID : int = Field(primary_key=True)
    User_ID : int = Field(foreign_key="user.User_ID")
    Sell_ID : int = Field(foreign_key="sell.Sell_ID")
    user : Optional["User"] = Relationship(sa_relationship=relationship(back_populates="cart"))
    sell : List["Sell"] = Relationship(sa_relationship=relationship(back_populates="cart"))