from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship , table
from typing import Optional,TYPE_CHECKING,List
from sqlalchemy.orm import relationship,Mapped

if TYPE_CHECKING:
    from .user import User
    from .sell import Sell
    from .shoporder import ShopOrder
    from .shopaddress import ShopAddress

class ShopBase(SQLModel):
    Shop_Name : str = Field(max_length=100, min_length=1, index=True)
    Shop_Phone : str = Field(max_length=20)
    User_ID : int = Field(foreign_key="user.User_ID", unique=True)
    


class Shop(ShopBase,table = True):
    __tablename__ = "shop"
    Shop_ID : int = Field(primary_key= True)

Shop.user = Relationship(sa_relationship=relationship(back_populates="shop"))
Shop.shopaddress = Relationship(sa_relationship=relationship(back_populates="shop"))
Shop.sell = Relationship(sa_relationship=relationship(back_populates="shop"))
Shop.shoporder = Relationship(sa_relationship=relationship(back_populates="shop"))