from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, table
from typing import Optional, TYPE_CHECKING
from sqlalchemy.orm import Mapped, relationship
from .sell import ItemPublic

if TYPE_CHECKING:
    from .user import User
    from .sell import Sell

class CartBase(SQLModel):
    Quantity: int = Field(default=1)
    
    User_ID: int = Field(foreign_key="users.User_ID", primary_key=True)
    Sell_ID: int = Field(foreign_key="sell.Sell_ID", primary_key=True)

class Cart(CartBase, table=True):
    __tablename__ = "cart"
    # Composite Primary Key (User_ID, Sell_ID)
    
    # Relationships
    user: Mapped["User"] = Relationship(sa_relationship=relationship(back_populates="cart_items"))
    sell_item: Mapped["Sell"] = Relationship(sa_relationship=relationship(back_populates="cart_items"))

class CartRead(CartBase):
    pass

class CartItemPublic(SQLModel):
    Quantity: int
    ItemDetails: ItemPublic