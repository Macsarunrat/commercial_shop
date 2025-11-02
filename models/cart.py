from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from sqlalchemy import ForeignKeyConstraint, PrimaryKeyConstraint # <--- เพิ่ม PrimaryKeyConstraint


class Cart(SQLModel, table=True):
    __tablename__ = "Cart"
    Cart_ID: Optional[int] = Field(default=None, primary_key=True)
    Quantity: int = Field(default=1)
    
    User_ID: Optional[int] = Field(default=None)
    Sell_ID: Optional[int] = Field(default=None)
    
    user: "User" = Relationship(back_populates="cart_items")
    sell_item: "Sell" = Relationship(back_populates="cart_items")

    __table_args__ = (
        ForeignKeyConstraint(["User_ID"], ["User.User_ID"], name="fk_cart_user"),
        ForeignKeyConstraint(["Sell_ID"], ["Sell.Sell_ID"], name="fk_cart_sell"),
    )

